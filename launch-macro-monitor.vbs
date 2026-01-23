Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "c:\Users\Ged\OneDrive\Documents\AI\macro-monitor"
WshShell.Run "cmd /c npm start", 0, False
