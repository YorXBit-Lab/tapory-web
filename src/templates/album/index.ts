import { registerTemplate } from '@/templates/registry';
import { ALBUM_STYLES, ALBUM_FIELDS } from './config';
import { AlbumSphere } from './layouts/Sphere';
import { AlbumHeart }  from './layouts/Heart';
import { AlbumOrbit }  from './layouts/Orbit';
import { AlbumMosaic } from './layouts/Mosaic';
import { AlbumCarousel } from './layouts/Carousel';
import { AlbumReel }   from './layouts/Reel';
import { AlbumSwipe }  from './layouts/Swipe';
import { AlbumPhotobooth } from './layouts/Photobooth';
import { AlbumRain }    from './layouts/Rain';
import { AlbumTunnel }  from './layouts/Tunnel';
import { AlbumDrift }   from './layouts/Drift';
import { AlbumCascade } from './layouts/Cascade';
import { AlbumHelix }   from './layouts/Helix';
import { AlbumWave }    from './layouts/Wave';

registerTemplate({
  id: 'album',
  styles: ALBUM_STYLES,
  fields: ALBUM_FIELDS,
  layouts: {
    sphere:   AlbumSphere,
    heart:    AlbumHeart,
    orbit:    AlbumOrbit,
    mosaic:   AlbumMosaic,
    carousel: AlbumCarousel,
    reel:     AlbumReel,
    swipe:    AlbumSwipe,
    photobooth: AlbumPhotobooth,
    rain:     AlbumRain,
    tunnel:   AlbumTunnel,
    drift:    AlbumDrift,
    cascade:  AlbumCascade,
    helix:    AlbumHelix,
    wave:     AlbumWave,
  },
  // Album tự bố cục ảnh — không dùng khung ảnh đơn / kiểu ảnh.
  frameIds: ['none', 'minimal'],
  imageModes: [],
});
