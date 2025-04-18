import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import { z } from 'zod';

// Define a generic interface for versioned data
interface VersionedData<T> {
  version: number;
  data: T;
}

// Base abstract class for version-specific serializers with proper typing
abstract class Serializer<InputType, SerializedType> {
  abstract readonly version: number;
  abstract readonly schema: z.ZodType<SerializedType>;
  abstract serialize(data: InputType): SerializedType;
  abstract deserialize(data: SerializedType): InputType;

  // Validate the data against the schema
  validate(data: unknown): SerializedType {
    return this.schema.parse(data);
  }

  export(data: InputType): VersionedData<SerializedType> {
    return { data: this.serialize(data), version: this.version };
  }
}

type SubmissionDeckV1 = {
  [name: string]: Array<{ description: string; collaborators: Array<string> }>;
};

class SubmissionV1Serializer extends Serializer<SubmissionDeckV1, SubmissionDeckV1> {
  readonly version = 0.1;
  readonly schema = z.object({}).catchall(
    z.array(
      z.object({
        description: z.string(),
        collaborators: z.array(z.string())
      })
    )
  );

  serialize(data: SubmissionDeckV1): SubmissionDeckV1 {
    return data;
  }

  deserialize(data: SubmissionDeckV1): SubmissionDeckV1 {
    return data;
  }
}

// Define migration function type
type MigrationFn<From, To> = (data: From) => To;

// Migration map entry type
type MigrationMapEntry<SupportedUnion> = {
  fromVersion: number;
  toVersion: number;
  migrate: MigrationFn<SupportedUnion, SupportedUnion>;
};

// Improved serialization manager with explicit typing
class SerializationManager<LatestType extends SupportedUnion, SupportedUnion> {
  private serializers: Map<number, Serializer<unknown, SupportedUnion>>;
  private migrations: MigrationMapEntry<SupportedUnion>[];
  private latestVersion: number;

  constructor(
    serializers: Serializer<unknown, SupportedUnion>[],
    migrations: MigrationMapEntry<SupportedUnion>[]
  ) {
    this.serializers = new Map();
    this.migrations = migrations;

    // Register serializers
    serializers.forEach((serializer) => {
      this.serializers.set(serializer.version, serializer);
    });

    // Determine latest version
    this.latestVersion = Math.max(...Array.from(this.serializers.keys()));
  }

  // Find appropriate migration
  private findMigration(
    fromVersion: number,
    toVersion: number
  ): MigrationFn<SupportedUnion, SupportedUnion> | undefined {
    const migration = this.migrations.find(
      (m) => m.fromVersion === fromVersion && m.toVersion === toVersion
    );
    return migration?.migrate;
  }

  // Helper method to transform data to target version format before serialization
  private transformToVersion<T extends SupportedUnion>(
    data: SupportedUnion,
    fromVersion: number,
    toVersion: number
  ): T {
    // If already at target version, return as is
    if (fromVersion === toVersion) {
      return data as T;
    }

    let currentData = data;
    let currentVersion = fromVersion;

    // Need to convert either up or down versions
    if (fromVersion < toVersion) {
      // Migrate up
      while (currentVersion < toVersion) {
        const nextVersion = currentVersion + 1;
        const migration = this.findMigration(currentVersion, nextVersion);
        if (!migration) {
          throw new Error(`No migration found from version ${currentVersion} to ${nextVersion}`);
        }
        currentData = migration(currentData as SupportedUnion);
        currentVersion = nextVersion;
      }
    } else {
      // Migrate down
      while (currentVersion > toVersion) {
        const prevVersion = currentVersion - 1;
        const migration = this.findMigration(currentVersion, prevVersion);
        if (!migration) {
          throw new Error(`No migration found from version ${currentVersion} to ${prevVersion}`);
        }
        currentData = migration(currentData as SupportedUnion);
        currentVersion = prevVersion;
      }
    }

    return currentData as T;
  }

  // Serialize to specific version (defaults to latest)
  serialize(data: LatestType, targetVersion: number = this.latestVersion): string {
    const serializer = this.serializers.get(targetVersion);
    if (!serializer) {
      throw new Error(`No serializer found for version ${targetVersion}`);
    }

    // Transform data to target version format if needed
    const transformedData = this.transformToVersion(data, this.latestVersion, targetVersion);

    // Now serialize with appropriate serializer
    const serialized = serializer.serialize(transformedData);
    const versionedData: VersionedData<unknown> = {
      version: targetVersion,
      data: serialized
    };

    return JSON.stringify(versionedData);
  }

  // Deserialize from any version to the latest
  deserialize(jsonStr: string): LatestType {
    const parsed = JSON.parse(jsonStr) as VersionedData<unknown>;
    const sourceVersion = parsed.version;
    const sourceData = parsed.data;

    // Validate the source data
    const sourceSerializer = this.serializers.get(sourceVersion);
    if (!sourceSerializer) {
      throw new Error(`No serializer found for version ${sourceVersion}`);
    }

    const validatedData = sourceSerializer.validate(sourceData);
    let currentData = sourceSerializer.deserialize(validatedData);

    // If already at latest version, return
    if (sourceVersion === this.latestVersion) {
      return currentData as LatestType;
    }

    // Otherwise, migrate up through versions
    let currentVersion = sourceVersion;
    while (currentVersion < this.latestVersion) {
      const nextVersion = currentVersion + 1;
      const migrationFn = this.findMigration(currentVersion, nextVersion);

      if (!migrationFn) {
        throw new Error(`No migration found from version ${currentVersion} to ${nextVersion}`);
      }

      currentData = migrationFn(currentData as SupportedUnion);
      currentVersion = nextVersion;
    }

    return currentData as LatestType;
  }

  // Optional: Deserialize to a specific version
  deserializeToVersion<T extends SupportedUnion>(jsonStr: string, targetVersion: number): T {
    const parsed = JSON.parse(jsonStr) as VersionedData<unknown>;
    const sourceVersion = parsed.version;

    // Validate the source data
    const sourceSerializer = this.serializers.get(sourceVersion);
    if (!sourceSerializer) {
      throw new Error(`No serializer found for version ${sourceVersion}`);
    }

    const sourceData: SupportedUnion = sourceSerializer.validate(parsed.data);
    const currentData = sourceSerializer.deserialize(sourceData) as SupportedUnion;

    // If already at target version, return
    if (sourceVersion === targetVersion) {
      return currentData as T;
    }

    // Transform to target version
    const transformedData = this.transformToVersion(currentData, sourceVersion, targetVersion);

    return transformedData as T;
  }
}

export { SerializationManager, Serializer, type MigrationMapEntry, type MigrationFn };

export { stringifyYaml, parseYaml };

import type { SimpleDeck } from './types';
(function test() {
  class SimpleDeckSerializer extends Serializer<SimpleDeck, SimpleDeck> {
    version = 0.2;
    schema = z.array(
      z.object({
        id: z.number(),
        name: z.string().regex(/[A-Z]\w*/),
        responsibilities: z.array(
          z.object({
            id: z.number(),
            description: z.string().nonempty(),
            collaborators: z.array(z.object({ id: z.number(), name: z.string().nonempty() }))
          })
        )
      })
    );
    serialize(data: SimpleDeck): SimpleDeck {
      return data;
    }
    deserialize(data: SimpleDeck): SimpleDeck {
      return data;
    }
  }

  type SubmissionUnion = SubmissionDeckV1 | SimpleDeck;

  const subV1Serializer = new SubmissionV1Serializer();
  const simpleDeckSerializer = new SimpleDeckSerializer();



  new SerializationManager<SimpleDeck, SubmissionUnion>(
    [subV1Serializer, simpleDeckSerializer],
    [
      {
        fromVersion: 0.1,
        toVersion: 0.2,
        migrate:
      }
    ]
  );
})();
