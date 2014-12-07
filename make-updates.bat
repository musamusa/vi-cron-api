NET STOP "viLogged Core"
NET STOP "viLogged API"

set source=%APPDATA%\viLogged\viLogged-Cron\updates\
set destination=%APPDATA%\viLogged\viLogged-Cron\
ROBOCOPY  %source% %destination% *.* /E

NET START "viLogged Core"
NET START "viLogged API"

RD /S /Q %source%
