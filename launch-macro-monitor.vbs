Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "c:\Users\GedSmith\OneDrive - Scott Logic Ltd\dev\macro-monitor"
WshShell.Run "node node_modules\electron\cli.js .", 0, False
