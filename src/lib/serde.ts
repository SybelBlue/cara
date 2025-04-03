// import { parse, stringify } from 'yaml';
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
}

// Example data structures for different versions
// V1: Simple user with name and email
interface UserV1 {
  name: string;
  email: string;
}

// V2: User with name split into first/last and added createdAt
interface UserV2 {
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
}

// Define a union type of all possible data types
type UserDataVersions = UserV1 | UserV2;

// V1 Serializer implementation
class UserSerializerV1 extends Serializer<UserV1, UserV1> {
  readonly version = 1;
  readonly schema = z.object({
    name: z.string(),
    email: z.string().email()
  });

  serialize(data: UserV1): UserV1 {
    return data;
  }

  deserialize(data: UserV1): UserV1 {
    return data;
  }
}

// V2 Serializer implementation
class UserSerializerV2 extends Serializer<UserV2, UserV2> {
  readonly version = 2;
  readonly schema = z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    createdAt: z.string().datetime()
  });

  serialize(data: UserV2): UserV2 {
    return data;
  }

  deserialize(data: UserV2): UserV2 {
    return data;
  }
}

// Type-safe migration functions
const migrateV1toV2 = (v1Data: UserV1): UserV2 => {
  const nameParts = v1Data.name.split(' ');
  return {
    firstName: nameParts[0] || '',
    lastName: nameParts.slice(1).join(' ') || '',
    email: v1Data.email,
    createdAt: new Date().toISOString()
  };
};

const migrateV2toV1 = (v2Data: UserV2): UserV1 => {
  return {
    name: `${v2Data.firstName} ${v2Data.lastName}`.trim(),
    email: v2Data.email
  };
};

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

// Example usage
function demo() {
  // Create serializers
  const v1Serializer = new UserSerializerV1();
  const v2Serializer = new UserSerializerV2();

  // Create migration mappings with proper typing
  const migrations: MigrationMapEntry<UserDataVersions>[] = [
    {
      fromVersion: 1,
      toVersion: 2,
      migrate: migrateV1toV2 as MigrationFn<UserDataVersions, UserDataVersions>
    },
    {
      fromVersion: 2,
      toVersion: 1,
      migrate: migrateV2toV1 as MigrationFn<UserDataVersions, UserDataVersions>
    }
  ];

  // Create manager with UserV2 as the latest type
  const userManager = new SerializationManager<UserV2, UserDataVersions>(
    [v1Serializer, v2Serializer],
    migrations
  );

  // V1 User
  const userV1: UserV1 = {
    name: 'John Doe',
    email: 'john@example.com'
  };

  // Convert V1 to V2 (since our manager expects the latest type)
  const userV1AsV2 = migrateV1toV2(userV1);

  // Serialize to V1 format (this now correctly transforms V2 data to V1 format before serializing)
  const serializedV1 = userManager.serialize(userV1AsV2, 1);
  console.log('Serialized V1:', serializedV1);

  // V2 User
  const userV2: UserV2 = {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    createdAt: new Date().toISOString()
  };

  // Serialize V2 user (to V2 format)
  const serializedV2 = userManager.serialize(userV2);
  console.log('Serialized V2:', serializedV2);

  // Deserialize V1 to latest (V2)
  const deserializedFromV1 = userManager.deserialize(serializedV1);
  console.log('Deserialized from V1:', deserializedFromV1);

  // Deserialize V2 specifically to V1
  const deserializedToV1 = userManager.deserializeToVersion<UserV1>(serializedV2, 1);
  console.log('Deserialized to V1:', deserializedToV1);
}

demo();
