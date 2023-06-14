#!/usr/bin/zsh

tmux source-file '/home/jeremy/.tmux.conf'

tmux new-session -d -s slidespecs '/home/jeremy/Code/SlideSpecs/app/start'

