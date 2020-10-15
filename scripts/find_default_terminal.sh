#!/bin/bash

if [ $(command -v x-term-emulator) ];then
    echo x-term-emulator
    $(x-term-emulator -e $1)
elif [ $(command -v gnome-terminal) ];then
    echo gnome-terminal
    $(gnome-terminal -- $1)
else
    exit 1
fi