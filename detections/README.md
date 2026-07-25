# Detection content

Every rule, artifact, and query published in a **Detection & Response** post lives here as a
real, runnable file — not just a code block in an article. Clone the repo, or pull a single
raw file straight into your platform.

## Layout

```
detections/
├── velociraptor/   # Velociraptor artifacts (.yaml)
├── yara/           # YARA rules (.yar)
└── sigma/          # Sigma rules (.yml)   [as posts add them]
```

One directory per detection format. Files are named after the rule/artifact they contain, so a
file can be dropped into a platform without renaming.

## Index

| File | Type | Purpose | Post |
|---|---|---|---|
| [`velociraptor/Custom.Windows.EventLogs.DefenderThreats.yaml`](velociraptor/Custom.Windows.EventLogs.DefenderThreats.yaml) | Velociraptor artifact | Fleet-wide sweep for Microsoft Defender threat-detection events (1006, 1015, 1116–1119) | [From Alert to Answer](../posts/from-alert-to-answer.html) |
| [`yara/browsersnatch.yar`](yara/browsersnatch.yar) | YARA rule | Detects the BrowserSnatch browser-credential stealer (T1555.003) | [From Alert to Answer](../posts/from-alert-to-answer.html) |

## Using them

**Velociraptor artifact** — paste into *View Artifacts → Add an Artifact* in the Velociraptor
GUI, or place the file in your server's custom artifact directory. Then collect or hunt it by
name:

```
Custom.Windows.EventLogs.DefenderThreats
```

**YARA rule** — feed to `yara64.exe`, or run it against a live endpoint through Velociraptor's
`Generic.Detection.Yara` artifacts / the `yara_scan_files` MCP tool:

```
yara64.exe -r detections/yara/browsersnatch.yar C:\Users\
```

## Caveats

These rules were written for the specific cases documented in the posts. Author-string matches
(`shaddy43`) are high fidelity for that tooling but will not generalise; tune thresholds and
paths before running them across a production estate. Test in a lab first.

## Reuse

Take these, adapt them, ship them in your own rule packs. Attribution back to the post is
appreciated but not required.
