# [1.14.0](https://github.com/liatrio/terraform-change-pr-commenter/compare/v1.13.0...v1.14.0) (2025-07-01)


### Features

* **action:** add support for `pull_request_target` event ([#95](https://github.com/liatrio/terraform-change-pr-commenter/issues/95)) ([fdfdbae](https://github.com/liatrio/terraform-change-pr-commenter/commit/fdfdbae2c1dbf02ed6a6334a334b99d2ed28f531)), closes [#94](https://github.com/liatrio/terraform-change-pr-commenter/issues/94)

# [1.13.0](https://github.com/liatrio/terraform-change-pr-commenter/compare/v1.12.0...v1.13.0) (2025-06-27)


### Features

* Truncate PR comments if too long ([#93](https://github.com/liatrio/terraform-change-pr-commenter/issues/93)) ([5587334](https://github.com/liatrio/terraform-change-pr-commenter/commit/55873345015c06f59316309a71ea9433104ed5f9)), closes [#91](https://github.com/liatrio/terraform-change-pr-commenter/issues/91)

# [1.12.0](https://github.com/liatrio/terraform-change-pr-commenter/compare/v1.11.0...v1.12.0) (2025-06-27)


### Features

* Simplify comment-header logic and improve multi-file support ([#92](https://github.com/liatrio/terraform-change-pr-commenter/issues/92)) ([de714c9](https://github.com/liatrio/terraform-change-pr-commenter/commit/de714c9edf0859d9851946cd93864c3b789e626a))

# [1.11.0](https://github.com/liatrio/terraform-change-pr-commenter/compare/v1.10.1...v1.11.0) (2025-06-16)


### Features

* allow workflow calls as triggers ([#89](https://github.com/liatrio/terraform-change-pr-commenter/issues/89)) ([bd5d6aa](https://github.com/liatrio/terraform-change-pr-commenter/commit/bd5d6aafb8c90a8cc0e3d78c32a0f33fcffa27de))

## [1.10.1](https://github.com/liatrio/terraform-change-pr-commenter/compare/v1.10.0...v1.10.1) (2025-05-30)


### Bug Fixes

* handle comment if no resources ([#88](https://github.com/liatrio/terraform-change-pr-commenter/issues/88)) ([4666dab](https://github.com/liatrio/terraform-change-pr-commenter/commit/4666dabe39891932028ca1b53a2172590009bad5))

# [1.10.0](https://github.com/liatrio/terraform-change-pr-commenter/compare/v1.9.0...v1.10.0) (2025-04-29)


### Features

* Add tags tracking, unchanged resources, and matrix support for jobs ([#87](https://github.com/liatrio/terraform-change-pr-commenter/issues/87)) ([b2f5356](https://github.com/liatrio/terraform-change-pr-commenter/commit/b2f535616c169467e523e6ff35ba684606ee2521))

# [1.9.0](https://github.com/liatrio/terraform-change-pr-commenter/compare/v1.8.0...v1.9.0) (2025-04-24)


### Features

* Add GitHub Actions to CodeQL analysis matrix ([#86](https://github.com/liatrio/terraform-change-pr-commenter/issues/86)) ([d410b01](https://github.com/liatrio/terraform-change-pr-commenter/commit/d410b015e84293a722b73dd529393aeaf2b2cacf))

# [1.8.0](https://github.com/liatrio/terraform-change-pr-commenter/compare/v1.7.1...v1.8.0) (2025-04-24)


### Features

* Add job link option, resolves [#84](https://github.com/liatrio/terraform-change-pr-commenter/issues/84) ([#85](https://github.com/liatrio/terraform-change-pr-commenter/issues/85)) ([0b450ba](https://github.com/liatrio/terraform-change-pr-commenter/commit/0b450ba53b357f81b54bf117c9dab15e2fd6cda8))

## [1.7.1](https://github.com/liatrio/terraform-change-pr-commenter/compare/v1.7.0...v1.7.1) (2024-12-12)


### Bug Fixes

* `hide-previous-comment` now can handel matrix strategy runs when given a unique `comment-header` ([#78](https://github.com/liatrio/terraform-change-pr-commenter/issues/78)) ([95ca081](https://github.com/liatrio/terraform-change-pr-commenter/commit/95ca081372ca566e0c8577d24353842679b527ee))

# [1.7.0](https://github.com/liatrio/terraform-change-pr-commenter/compare/v1.6.0...v1.7.0) (2024-09-03)


### Features

* adds an input for showing the full list of changed resources in the action output ([#68](https://github.com/liatrio/terraform-change-pr-commenter/issues/68)) ([815d669](https://github.com/liatrio/terraform-change-pr-commenter/commit/815d669c00d3bcb18303a846c49ef49cd2ab19db))

# [1.6.0](https://github.com/liatrio/terraform-change-pr-commenter/compare/v1.5.0...v1.6.0) (2024-09-03)


### Features

* ability to hide previous comments & fix for summary issue ([#65](https://github.com/liatrio/terraform-change-pr-commenter/issues/65)) ([08ba12c](https://github.com/liatrio/terraform-change-pr-commenter/commit/08ba12cd559192754993f85f0e45de37f095e248))

# [1.5.0](https://github.com/liatrio/terraform-change-pr-commenter/compare/v1.4.5...v1.5.0) (2024-05-08)


### Features

* additional feature additions ([#62](https://github.com/liatrio/terraform-change-pr-commenter/issues/62)) ([1465fa2](https://github.com/liatrio/terraform-change-pr-commenter/commit/1465fa28232ee9e3b51c5db1fa43f2c2f4b971e4))
* multiple feature addition [#58](https://github.com/liatrio/terraform-change-pr-commenter/issues/58)  ([#60](https://github.com/liatrio/terraform-change-pr-commenter/issues/60)) ([01f0321](https://github.com/liatrio/terraform-change-pr-commenter/commit/01f0321246312425041b0ee8eaa5ba9404f6f1ae))


### Reverts

* Revert " feat: multiple feature addition #58  (#60)" (#63) ([ab68bb6](https://github.com/liatrio/terraform-change-pr-commenter/commit/ab68bb614b5eb42957331703bf7afa80e1188186)), closes [#58](https://github.com/liatrio/terraform-change-pr-commenter/issues/58) [#60](https://github.com/liatrio/terraform-change-pr-commenter/issues/60) [#63](https://github.com/liatrio/terraform-change-pr-commenter/issues/63)

## [1.4.5](https://github.com/liatrio/terraform-change-pr-commenter/compare/v1.4.4...v1.4.5) (2024-02-02)


### Bug Fixes

* Update actions to use actions with versions with node20 ([#56](https://github.com/liatrio/terraform-change-pr-commenter/issues/56)) ([2365114](https://github.com/liatrio/terraform-change-pr-commenter/commit/236511422a9364c7adb215a172eec7173ce18374))
* Update release.yml ([#55](https://github.com/liatrio/terraform-change-pr-commenter/issues/55)) ([d527888](https://github.com/liatrio/terraform-change-pr-commenter/commit/d5278883cce02e2713a70a70b80adbf7390a7476))

## [1.4.5](https://github.com/liatrio/terraform-change-pr-commenter/compare/v1.4.4...v1.4.5) (2024-02-02)


### Bug Fixes

* Update release.yml ([#55](https://github.com/liatrio/terraform-change-pr-commenter/issues/55)) ([d527888](https://github.com/liatrio/terraform-change-pr-commenter/commit/d5278883cce02e2713a70a70b80adbf7390a7476))

## [1.4.4](https://github.com/liatrio/terraform-change-pr-commenter/compare/v1.4.3...v1.4.4) (2024-02-02)


### Bug Fixes

* update line 24 to node20 ([#53](https://github.com/liatrio/terraform-change-pr-commenter/issues/53)) ([d84a976](https://github.com/liatrio/terraform-change-pr-commenter/commit/d84a976ce8bee75080d34f46b39d1c28f2cfec3a))

## [1.4.2](https://github.com/liatrio/terraform-change-pr-commenter/compare/v1.4.1...v1.4.2) (2024-02-01)


### Bug Fixes

* Node bump to 20 from 16 ([#51](https://github.com/liatrio/terraform-change-pr-commenter/issues/51)) ([2da4521](https://github.com/liatrio/terraform-change-pr-commenter/commit/2da45213eef1edc22a05b22bb198b0d94e0cf2a0))

# [1.4.0](https://github.com/liatrio/terraform-change-pr-commenter/compare/v1.3.3...v1.4.0) (2023-01-09)


### Features

* add job summary ([#36](https://github.com/liatrio/terraform-change-pr-commenter/issues/36)) ([01d3b49](https://github.com/liatrio/terraform-change-pr-commenter/commit/01d3b49e93cf0319d28dee2b3fbab268b6566df9))

## [1.3.2](https://github.com/liatrio/terraform-change-pr-commenter/compare/v1.3.1...v1.3.2) (2022-06-09)


### Bug Fixes

* [#30](https://github.com/liatrio/terraform-change-pr-commenter/issues/30) empty plan would failed the action ([#31](https://github.com/liatrio/terraform-change-pr-commenter/issues/31)) ([c4ea052](https://github.com/liatrio/terraform-change-pr-commenter/commit/c4ea0520ce5c086465dda4da3f75fca6527a60e0))

## [1.3.1](https://github.com/liatrio/terraform-change-pr-commenter/compare/v1.3.0...v1.3.1) (2022-04-29)


### Bug Fixes

* operator for replace was broken in last fixes ([#25](https://github.com/liatrio/terraform-change-pr-commenter/issues/25)) ([e82bf94](https://github.com/liatrio/terraform-change-pr-commenter/commit/e82bf94e915ad440bd0c08e69dcd9ef748a74ed2))

# [1.3.0](https://github.com/liatrio/terraform-change-pr-commenter/compare/v1.2.0...v1.3.0) (2022-04-29)


### Features

* added support for 'replace', and 'unchanged' ([#24](https://github.com/liatrio/terraform-change-pr-commenter/issues/24)) ([a3c45b0](https://github.com/liatrio/terraform-change-pr-commenter/commit/a3c45b0c735a3c4467729d0f94730c2af583a5e2))

# [1.2.0](https://github.com/liatrio/terraform-change-pr-commenter/compare/v1.1.0...v1.2.0) (2022-04-01)


### Features

* adding comment block expand flag ([55d2573](https://github.com/liatrio/terraform-change-pr-commenter/commit/55d25736974196a554e7ed4d864224b54af0123d))

# [1.1.0](https://github.com/liatrio/terraform-change-pr-commenter/compare/v1.0.2...v1.1.0) (2022-02-23)


### Features

* Support for multiple plans ([#13](https://github.com/liatrio/terraform-change-pr-commenter/issues/13)) ([9dc08b0](https://github.com/liatrio/terraform-change-pr-commenter/commit/9dc08b01a7f2000f9a8721c4be3479079642580e))

## [1.0.2](https://github.com/liatrio/terraform-change-pr-commenter/compare/v1.0.1...v1.0.2) (2022-02-13)


### Bug Fixes

* using yarn build to remove npm dependency vulnerabilities ([3777d7b](https://github.com/liatrio/terraform-change-pr-commenter/commit/3777d7bb2204009d82f659632a95372e71c08dfc))

## [1.0.1](https://github.com/liatrio/terraform-change-pr-commenter/compare/v1.0.0...v1.0.1) (2022-02-05)


### Bug Fixes

* adding branding to the action ([e40fd0c](https://github.com/liatrio/terraform-change-pr-commenter/commit/e40fd0c772ab36937de7e86ae71e3e6f013b5a70))

# 1.0.0 (2022-01-29)


### Features

* initial release v1.0.0 ([90eaf6e](https://github.com/liatrio/terraform-change-pr-commenter/commit/90eaf6ef9875330479e2368eaf669099c740b006))
