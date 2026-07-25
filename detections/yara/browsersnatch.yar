/*
   BrowserSnatch stealer - host detection rule
   Used in: "From Alert to Answer: AI-Driven DFIR with Claude Code & Velociraptor"
   https://shaddy43.github.io/DetectionAndResponse/posts/from-alert-to-answer.html

   Upstream source: https://github.com/shaddy43/BrowserSnatch/wiki/YARA-Rule
*/

rule BrowserSnatch_Stealer {
    meta:
        description  = "Detects the BrowserSnatch browser data extraction tool"
        author       = "shaddy43"
        date         = "2026-07-15"
        reference    = "https://github.com/shaddy43/BrowserSnatch"
        mitre_attack = "T1555.003"
        severity     = "Critical"
    strings:
        // High-fidelity author / project / drop-file markers
        $h1 = "shaddy43" ascii wide
        $h2 = "BrowserSnatch" ascii wide
        $h3 = "NTUSER.dat" ascii wide
        // Command-line flags
        $s1 = "-greed" ascii wide
        $s2 = "-app-bound-decryption" ascii wide
        $s3 = "-recalibrate" ascii wide
        $s4 = "-service" ascii wide
        $s5 = "-cookies" ascii wide
        $s6 = "-bookmarks" ascii wide
        $s7 = "-history" ascii wide
        $s8 = "-pass" ascii wide
        // Snatch / stealer + browser store references
        $g1 = "snatch" ascii wide nocase
        $g2 = "stealer" ascii wide nocase
        $b1 = "Login Data" ascii wide
        $b2 = "Local State" ascii wide
        $b3 = "logins.json" ascii wide
        $b4 = "key4.db" ascii wide
    condition:
        uint16(0) == 0x5A4D and      // PE file
        filesize < 5MB and
        (
            $h2 or                    // "BrowserSnatch" alone is definitive
            ($h1 and $h3) or          // author + Public NTUSER.dat drop marker
            (3 of ($s*)) or           // three or more tool flags
            ((1 of ($g*)) and (3 of ($s*))) or
            ((1 of ($g*)) and (2 of ($b*)) and (1 of ($h*)))
        )
}
