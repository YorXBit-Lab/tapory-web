import { registerTemplate } from '@/templates/registry';
import { ALBUM_STYLES, ALBUM_FIELDS } from './config';
import { AlbumSphere } from './layouts/Sphere';
import { AlbumHeart }  from './layouts/Heart';
import { AlbumOrbit }  from './layouts/Orbit';

registerTemplate({
  id: 'album',
  styles: ALBUM_STYLES,
  fields: ALBUM_FIELDS,
  layouts: {
    sphere: AlbumSphere,
    heart:  AlbumHeart,
    orbit:  AlbumOrbit,
  },
  // Album tự bố cục ảnh — không dùng khung ảnh đơn / kiểu ảnh.
  frameIds: ['none', 'minimal'],
  imageModes: [],
});
