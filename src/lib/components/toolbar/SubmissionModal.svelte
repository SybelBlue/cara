<script module lang="ts">
  export type Props = {
    submissionYaml: string;
    close?: () => void;
  };
</script>

<script lang="ts">
  import { Highlight } from 'svelte-highlight';
  import { yaml } from 'svelte-highlight/languages';

  import { copyToClipboard } from '$lib/common';

  let { submissionYaml, close }: Props = $props();
  let justCopied = $state(false);
</script>

<dialog class="modal modal-open max-h-full max-w-full">
  <div class="modal-box max-h-3/4 static flex-col">
    <button
      class:italic={justCopied}
      class="flex btn btn-block btn-primary mb-2"
      onclick={() => {
        copyToClipboard(submissionYaml);
        justCopied = true;
        setTimeout(() => (justCopied = false), 2000);
        setTimeout(() => close?.(), 1000);
      }}
    >
      {justCopied ? 'copied!' : 'copy to clipboard'}
    </button>
    <div class="flex w-full overflow-auto">
      <div class="card w-full dark:card-bordered shadow-md max-w-full">
        <section class="card-body h-fit text-sm">
          <Highlight language={yaml} code={submissionYaml} />
        </section>
      </div>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button onclick={() => close?.()}>close</button>
  </form>
</dialog>
