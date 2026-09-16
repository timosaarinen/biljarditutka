# Puksu Room — proposed setup

**Candidate venue only; approval pending.** This is a planning and measurement template, not evidence of an installed or approved system. The legacy filename is retained to avoid breaking links. The venue's name is Puksu Room, not Pukuroom.

See the [public venue profile](clients/puksuroom/README.md), [media inventory](clients/puksuroom/MEDIA.md) and [blank site survey](clients/puksuroom/SITE_SURVEY.md). Keep completed operational details private unless a reviewed public version is explicitly approved.

## Before inspection or capture

Agree venue and any property/mounting permissions, safety responsibilities, appropriate data-processing arrangements and notices, and an immediate stop/removal procedure. Installation approval does not automatically permit customer/staff recording or publication of photos and branding. Do not enable audio or persistent video storage by default.

## Hardware

- [ ] exact USB webcam model
- [ ] capture resolutions / frame rates supported on Linux
- [ ] host computer selected
- [ ] safe removable overhead mount designed and approved
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

After the necessary approvals, photograph the empty table from the intended camera position. Only retain or publish representative regression-test frames after reviewing personal data, image rights and venue permission.

## Quick Linux camera inspection

On Omarchy / Arch Linux:

```bash
sudo pacman -S --needed v4l-utils ffmpeg
lsusb
v4l2-ctl --list-devices
v4l2-ctl --list-formats-ext -d /dev/video0
ffplay -f v4l2 /dev/video0
```

Do not assume `/dev/video0` is the desired stream: some webcams expose multiple video nodes. These commands inspect camera capabilities; they do not authorize filming people or installing equipment.

## Calibration target

The first calibration UI / tool should make it easy to identify the four playable-table corners in a captured frame and produce a top-down normalized coordinate transform.

Calibration data should be stored as installation configuration, not compiled into the program.

## Proposed MVP acceptance

A first field prototype would be useful when it can:

1. open the selected webcam reliably,
2. show the calibrated top-down table view, with saving separately controlled,
3. locate visible balls,
4. maintain stable ball identities / positions while they move,
5. expose confidence and useful debug output when it is wrong.

These are development goals, not currently demonstrated capabilities. Scoring comes after reliable observation. Human scoring remains authoritative during a trial.
