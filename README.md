# Window View (soksak-plugin-window)

Shows a **window scene** at the bottom of the left sidebar. Inside a white frame, sky, sun, moon,
stars, clouds, mountains, hills, ground, and trees change with the **current time** — the sun
rises in the morning, the sky glows at sunset, and the moon and stars come out at night.
Transitions take 1 second and are smooth.

## Time Phases

Automatically follows local time (no toggle):

| phase | time |
|---|---|
| `day` | 07:00–16:59 |
| `sunset` | 17:00–18:29 |
| `dusk` | 18:30–19:59 |
| `night` | 20:00–06:59 |

## Permissions

- `ui` — mounts the view in the left sidebar (host owns the placement).
- `commands` — registers the two commands below.

The current time is read from the local `Date`; no network or storage permissions are used.

## Commands (auto-exposed via CLI/MCP)

```bash
sok plugin.soksak-plugin-window.state
# → { phase, forced, auto, now, nextPhase, nextInMs }

sok plugin.soksak-plugin-window.set '{"phase":"night"}'   # force (preview/verification)
sok plugin.soksak-plugin-window.set '{}'                  # return to automatic tracking
```

## Performance

No animation loop. Only one `setTimeout` is scheduled until the next phase boundary (no polling);
a 1-second CSS transition runs only at the moment of transition — positions use `transform`
(zero layout cost), colours use `fill`.
CPU usage at idle: 0.

## Credits

Original work: **oliviale (Olivia Ng)** — CodePen "CSS Animations Experiment Part II"

- Original: <https://codepen.io/oliviale/pen/ELPvLM>
- Part I: <https://codepen.io/oliviale/details/jxPgKv>

The original uses jQuery + Pug + SCSS with 4 manual toggles (Dusk/Day/Sunset/Night). This plugin
keeps the SVG artwork as-is, removes jQuery, and ports it to pure DOM with automatic time
tracking. Copyright of the original SVG artwork belongs to the original author; the licence
follows the original CodePen. Retain this credit when redistributing.
