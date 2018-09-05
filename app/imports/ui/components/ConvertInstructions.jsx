import React, {Component} from 'react';

class UploadInstructions extends Component {
  render() {
    return (
      <div>
        first, export your presentation to a set of images. image export guides:
        <ul>
          <li>
            <a
              href="https://hislide.io/2017/06/22/keynote-exporting-slides-png-jpg-tiff/"
              target="_blank">
              keynote (osx)
            </a>
          </li>
          <li>
            <a
              href="https://www.lifewire.com/create-pictures-from-powerpoint-slides-2767362"
              target="_blank">
              ms powerpoint
            </a>
          </li>
          <li>
            <a
              href="https://www.wikihow.com/Convert-PDF-to-Image-Files#Using_Adobe_Acrobat_Pro"
              target="_blank">
              general pdf (adobe acrobat)
            </a>
          </li>
          <li>
            <a href="https://superuser.com/questions/633698/" target="_blank">
              general pdf (image magick)
            </a>
          </li>
        </ul>
      </div>
    );
  }
}

export default UploadInstructions;
