=== Copy Blocky ===
Contributors: 		Cutch
Tags: 				copy, styles
Requires at least: 	5.6
Tested up to: 		6.1
Stable tag: 		1.0.1
License: 			GPLv3
License URI: 		https://www.gnu.org/licenses/gpl-3.0.en.html

Copy and Paste Gutenberg blocks and styles.

== Description ==

Using either ctrl+c and ctrl+shift+v (Configurable from settings), or the the copy styles button in the block editor. Copy and paste the type and styles from one block to another.
Ex. Click a header block, press ctrl+c (to copy), then click a paragraph block, and press ctrl+shift+v.

Note: For apple devices use the cmd key instead of ctrl. ex. cmd+c and cmd+shift+v.

= Features =
 - Convert to blocks which do not have a direct conversion
 - Copy styles from multiple blocks to another set of blocks, or one block to many
 - Retain block attributes during conversion. Ex. h6 for headings, or css classes.


== Frequently asked questions ==

= Why don't my text styles (bold, italics) copy =

Unfortunately, text styles are tied to the content itself. This plugin can be used to convert copy and paste your h3 headings, or turn list bullets into numbers. The "styles" are block styles not text styles.

= Can use this on multiple blocks =

Yes, you can copy from and paste to any number of blocks.

= Will this work on custom or abnormal blocks =

If the custom blocks supports the transformation from a core block it may work. Otherwise, it does the best it can.
However, I wouldn't expect text to turn into images. If there are some cases that are missing or a block its not working for, post it here [GitHub Issues](https://github.com/Cutch/copy-blocky/issues).


== Installation ==

Just follow the [Automatic Plugin Installation](https://wordpress.org/support/article/managing-plugins/#automatic-plugin-installation) procedure.

== Issues ==

Please post an issue in the [GitHub Issues](https://github.com/Cutch/copy-blocky/issues)

== Changelog ==

= 1.0.1 =
* Fixed an issue with some transformations not copying the block attributes.

= 1.0.0 =
* Initial Version
