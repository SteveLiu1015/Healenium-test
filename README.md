# Healenium self-healing sandbox

Svelte 5 + Vite app with switchable DOM "breakages", a TypeScript `selenium-webdriver` + Mocha
suite, and a Healenium-Proxy stack (Postgres, hlm-backend, selector-imitator, hlm-proxy,
Selenium Grid + Chrome) running under Docker Engine inside WSL2.

```
app/        Svelte app. `--mode <variant>` picks a DOM variant via .env.<variant>
tests/      Selenium tests talking to hlm-proxy (:8085) instead of a local driver
healenium/  docker-compose.yaml for the Healenium + Grid stack
```

## Prerequisites (inside WSL2)

- Docker Engine + compose plugin (`docker compose version`), daemon running
- Node 20+

Run every command below from a WSL shell in `/mnt/c/Development/selenium`.

## 1. Install

```bash
npm install
```

## 2. Start the Healenium stack

```bash
npm run hlm:up
npm run hlm:ps            # 6 services Up
curl -s localhost:7878/healenium/report | head -3
```

- Report UI: http://localhost:7878/healenium/report
- Grid UI: http://localhost:4444/ui
- Watch the browser live (noVNC): http://localhost:7900

## 3. Record the baseline

Terminal A:

```bash
npm run dev:baseline      # Vite on 0.0.0.0:5173
```

Terminal B:

```bash
npm test
```

All tests pass and Healenium stores the successful locator paths for this URL.
Sanity-check that the Chrome container can reach Vite:

```bash
docker exec node-chrome curl -s http://host.docker.internal:5173 | head -3
```

## 4. Break the DOM and watch it heal

Stop Vite in terminal A and restart it with a variant, then rerun the tests.

| Variant             | Change                                                            | Locator that breaks                      |
| ------------------- | ----------------------------------------------------------------- | ---------------------------------------- |
| `dev:rename-id`     | `#name`→`#full-name`, `#email`→`#email-address`, `#submit-btn`→`#send-btn`, `#result`→`#confirmation` | `By.id(...)`, `form > footer > p#result` |
| `dev:rename-class`  | `btn primary` → `button button--primary`                          | `button.btn.primary`                     |
| `dev:nest-deeper`   | form wrapped in `section.card > div.card-body`, result in `div.status` | `form > footer > p#result`          |
| `dev:change-text`   | "Send message" → "Submit form"                                    | `//button[normalize-space()='Send message']` |
| `dev:change-tag`    | `<button>` → `<a role="button">`                                  | both submit locators                     |
| `dev:all`           | everything at once                                                | all of the above                         |

```bash
npm run dev:rename-id     # terminal A
npm test                  # terminal B
npm run hlm:logs          # healing lines in hlm-proxy
```

Open http://localhost:7878/healenium/report to see the healed locators, scores and screenshots.

## 5. Control run: without Healenium

Two ways to prove the tests only pass because of healing (keep a broken variant running):

```bash
npm run test:direct       # bypass hlm-proxy entirely: tests -> Selenium Grid :4444
```

```bash
npm run hlm:heal-off      # keep the proxy but recreate it with HEAL_ENABLED=false
npm test
npm run hlm:heal-on
```

Both fail with `NoSuchElementError: ... *[id="name"]` on any non-baseline variant.
The third test (`can opt out of healing for a section`) is written to *expect* that failure, so it
is the one test that still passes in these control runs — it demonstrates per-section opt-out via
`driver.executeScript('disable_healing_true' | 'disable_healing_false')`.

## Tuning

Copy `healenium/.env.example` to `healenium/.env` and adjust `SCORE_CAP` (default `.6`) or
`RECOVERY_TRIES`. `npm run hlm:reset` wipes the Postgres volume so you can re-record a fresh baseline.

Observed with the default cap: `rename-id` heals every locator at score ≈0.86 (`input#name` → `input#full-name`).
In `dev:all` the submit element changes tag, id, class and text at once; the best candidate scores
below 0.6 and the proxy logs `Score property = 0.6 is bigger than healing's locator score`, so the
two submit tests fail with `NoSuchElementError`. Lower `SCORE_CAP` to see borderline heals.

## Notes

- Only `findElement` is healed (`FIND_ELEMENTS_AUTO_HEALING=false`); the page object avoids `findElements`.
- Healenium keys stored selectors by page URL, so variants are switched by Vite mode rather than query string.
- `COLLECT_METRICS=false` keeps locator/domain metrics from being sent upstream.
