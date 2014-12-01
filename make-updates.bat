NET STOP "viLogged Core"
NET STOP "viLogged API"

set source=%APPDATA%\viLogged\viLogged-Crone\updates
set destination=%APPDATA%\viLogged\viLogged-Crone
xcopy %source% %destination% /y

RD /S /Q %source%

NET START "viLogged Core"
NET START "viLogged API"