<script lang="ts">
  import {
    variant,
    renameId,
    renameClass,
    nestDeeper,
    changeText,
    changeTag,
  } from './lib/variant'

  let name = $state('')
  let email = $state('')
  let topic = $state('support')
  let submitted = $state(false)
  let form: HTMLFormElement

  const ids = {
    name: renameId ? 'full-name' : 'name',
    email: renameId ? 'email-address' : 'email',
    topic: renameId ? 'subject' : 'topic',
    submit: renameId ? 'send-btn' : 'submit-btn',
    result: renameId ? 'confirmation' : 'result',
  }
  const submitClass = renameClass ? 'button button--primary' : 'btn primary'
  const submitLabel = changeText ? 'Submit form' : 'Send message'

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault()
    submitted = true
  }

  function anchorClick(e: MouseEvent) {
    e.preventDefault()
    form.requestSubmit()
  }
</script>

{#snippet contactForm()}
  <form id="contact-form" bind:this={form} onsubmit={handleSubmit}>
    <label>
      Name
      <input id={ids.name} name="name" type="text" bind:value={name} required />
    </label>
    <label>
      Email
      <input id={ids.email} name="email" type="email" bind:value={email} required />
    </label>
    <label>
      Topic
      <select id={ids.topic} name="topic" bind:value={topic}>
        <option value="support">Support</option>
        <option value="sales">Sales</option>
        <option value="feedback">Feedback</option>
      </select>
    </label>

    {#if changeTag}
      <a id={ids.submit} class={submitClass} role="button" href="#send" onclick={anchorClick}>
        {submitLabel}
      </a>
    {:else}
      <button id={ids.submit} class={submitClass} type="submit">{submitLabel}</button>
    {/if}

    <footer>
      {#if nestDeeper}
        <div class="status">
          <p id={ids.result} data-state={submitted ? 'done' : 'idle'}>
            {submitted ? `Thanks, ${name}! We'll reply about ${topic}.` : ''}
          </p>
        </div>
      {:else}
        <p id={ids.result} data-state={submitted ? 'done' : 'idle'}>
          {submitted ? `Thanks, ${name}! We'll reply about ${topic}.` : ''}
        </p>
      {/if}
    </footer>
  </form>
{/snippet}

<main>
  <h1>Contact us</h1>
  <p class="variant-badge">DOM variant: <strong data-variant={variant}>{variant}</strong></p>

  {#if nestDeeper}
    <section class="card">
      <div class="card-body">
        {@render contactForm()}
      </div>
    </section>
  {:else}
    {@render contactForm()}
  {/if}
</main>
