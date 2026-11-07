#!/usr/bin/env bash
# Runs inside the emulator step in CI: the emulator is booted, adb is connected.
set -euo pipefail

adb wait-for-device
adb shell getprop ro.build.version.release

cd appium
npx wdio run ./wdio.conf.ts
