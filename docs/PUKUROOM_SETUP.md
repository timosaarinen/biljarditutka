# Pukuroom reference setup

Pukuroom is the first real Biljarditutka installation and should remain the reference environment while the MVP is being proven.

This document is intentionally a measurement sheet before it becomes an installation guide.

## Hardware

- [ ] exact USB webcam model
- [ ] capture resolutions / frame rates supported on Linux
- [ ] host computer selected
- [ ] removable overhead mount designed
- [ ] cable routing checked

## Table measurements

Record these before hard-coding assumptions anywhere:

- playing-surface width: **TBD**
- playing-surface length: **TBD**
- rail width: **TBD**
- pocket locations / geometry: **TBD**
- ceiling / camera mounting height: **TBD**
- camera offset from table centre: **TBD**
- dominant lighting conditions: **TBD**

Photograph the empty table from the intended camera position and keep representative frames for regression tests once the capture pipeline exists.

## Quick Linux camera inspection

On Omarchy / Arch Linux:

```bash
sudo pacman -S --needed v4l-utils ffmpeg
lsusb
v4l2-ctl --list-devices
v4l2-ctl --list-formats-ext -d /dev/video0
ffplay -f v4l2 /dev/video0
```

Do not assume `/dev/video0` is the desired stream: some webcams expose multiple video nodes.

## Calibration target

The first calibration UI / tool should make it easy to identify the four playable-table corners in a captured frame and produce a top-down normalized coordinate transform.

Calibration data should be stored as installation configuration, not compiled into the program.

## MVP acceptance at Pukuroom

A first field prototype is useful when it can:

1. open the real webcam reliably,
2. show / save the calibrated top-down table view,
3. locate visible balls,
4. maintain stable ball identities / positions while they move,
5. expose confidence and useful debug output when it is wrong.

Scoring comes after this is boringly reliable.
