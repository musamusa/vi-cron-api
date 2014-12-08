
set source="%~dp0"updates\
set destination="%~dp0"
ROBOCOPY  %source% %destination% *.* /E
RD /S /Q %source%
