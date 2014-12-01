NET STOP "viLogged Core"
NET STOP "viLogged API"

set source=%APPDATA%\viLogged\viLogged-Crone\updates
set destination=%APPDATA%\viLogged\viLogged-Crone
xcopy %source% %destination% /y

NET START "viLogged Core"
NET START "viLogged API"