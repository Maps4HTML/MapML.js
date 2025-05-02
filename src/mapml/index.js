/*
 * Copyright 2015-2024 Canada Centre for Mapping and Earth Observation,
 * Earth Sciences Sector, Natural Resources Canada.
 *
 * License
 *
 * By obtaining and/or copying this work, you (the licensee) agree that you have
 * read, understood, and will comply with the following terms and conditions.
 *
 * Permission to copy, modify, and distribute this work, with or without
 * modification, for any purpose and without fee or royalty is hereby granted,
 * provided that you include the following on ALL copies of the work or portions
 * thereof, including modifications:
 *
 * The full text of this NOTICE in a location viewable to users of the
 * redistributed or derivative work.
 *
 * Any pre-existing intellectual property disclaimers, notices, or terms and
 * conditions. If none exist, the W3C Software and Document Short Notice should
 * be included.
 *
 * Notice of any changes or modifications, through a copyright statement on the
 * new code or document such as "This software or document includes material
 * copied from or derived from [title and URI of the W3C document].
 * Copyright © [YEAR] W3C® (MIT, ERCIM, Keio, Beihang)."
 *
 * Disclaimers
 *
 * THIS WORK IS PROVIDED "AS IS," AND COPYRIGHT HOLDERS MAKE NO REPRESENTATIONS
 * OR WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO, WARRANTIES OF
 * MERCHANTABILITY OR FITNESS FOR ANY PARTICULAR PURPOSE OR THAT THE USE OF THE
 * SOFTWARE OR DOCUMENT WILL NOT INFRINGE ANY THIRD PARTY PATENTS, COPYRIGHTS,
 * TRADEMARKS OR OTHER RIGHTS.
 * COPYRIGHT HOLDERS WILL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, SPECIAL OR
 * CONSEQUENTIAL DAMAGES ARISING OUT OF ANY USE OF THE SOFTWARE OR DOCUMENT.
 *
 * The name and trademarks of copyright holders may NOT be used in advertising or
 * publicity pertaining to the work without specific, written prior permission.
 * Title to copyright in this work will at all times remain with copyright holders.
 */
import './GlobalM.js';

import { HTMLMapmlViewerElement } from '../mapml-viewer.js';
import { HTMLLayerElement } from '../mapml-viewer.js';
import { HTMLMapCaptionElement } from '../mapml-viewer.js';
import { HTMLFeatureElement } from '../mapml-viewer.js';
import { HTMLTileElement } from '../mapml-viewer.js';
import { HTMLExtentElement } from '../mapml-viewer.js';
import { HTMLInputElement } from '../mapml-viewer.js';
import { HTMLSelectElement } from '../mapml-viewer.js';
import { HTMLLinkElement } from '../mapml-viewer.js';
import { HTMLStyleElement } from '../mapml-viewer.js';
import { HTMLWebMapElement as HTMLMapElement } from '../mapml-viewer.js';
import { HTMLMapAreaElement as HTMLAreaElement } from '../mapml-viewer.js';

window.MapML = {
  HTMLMapmlViewerElement,
  HTMLLayerElement,
  HTMLMapCaptionElement,
  HTMLFeatureElement,
  HTMLTileElement,
  HTMLExtentElement,
  HTMLInputElement,
  HTMLSelectElement,
  HTMLLinkElement,
  HTMLStyleElement,
  HTMLMapElement,
  HTMLAreaElement
};
