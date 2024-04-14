import { debug } from "@debug";
import { character_code_map } from "@root/_graphics/text";
import texture_atlas_data_url from "@res/sheet.webp";
import { gl } from "@root/_graphics/gl";

let texture_definitions: TextureDefinition[] = [
  [TEXTURE_TYPE_SPRITE, [TEXTURE_C_4x4], 0, 16, 4, 4],
  [TEXTURE_TYPE_SPRITE, [TEXTURE_C_5x5], 4, 16, 5, 5],
  [TEXTURE_TYPE_SPRITE, [TEXTURE_C_6x6], 9, 16, 6, 6],
  [TEXTURE_TYPE_SPRITE, [TEXTURE_C_7x7], 0, 22, 7, 7],
  [TEXTURE_TYPE_SPRITE, [TEXTURE_C_8x8], 7, 22, 8, 8],
  [TEXTURE_TYPE_SPRITE_STRIP, [TEXTURE_C_16x16, TEXTURE_GRASS_1, TEXTURE_GRASS_2, TEXTURE_GRASS_3, TEXTURE_GRASS_4, TEXTURE_FLOWERS, TEXTURE_A_BUTTON_UP, TEXTURE_B_BUTTON_UP,
    TEXTURE_A_BUTTON_DOWN, TEXTURE_B_BUTTON_DOWN, TEXTURE_D_PAD, TEXTURE_D_PAD_UP, TEXTURE_D_PAD_RIGHT, TEXTURE_D_PAD_DOWN, TEXTURE_D_PAD_LEFT], 16, 16, 16, 16],
];

export let TEXTURE_CACHE: TextureCache = [];

function make_texture(_w: number, _h: number, _u0: number, _v0: number, _u1: number, _v1: number): Texture
{
  return { w_: _w, h_: _h, u0_: _u0, v0_: _v0, u1_: _u1, v1_: _v1 };
};

export async function load_textures(): Promise<void>
{
  return new Promise(async (resolve) =>
  {
    let response = await fetch(texture_atlas_data_url);
    let blob = await response.blob();
    let image_bitmap = await createImageBitmap(blob);

    debug.assert(ATLAS_WIDTH === image_bitmap.width, `ATLAS WIDTH CHANGED (expected: ${ATLAS_WIDTH} actual: ${image_bitmap.width})`);
    debug.assert(ATLAS_HEIGHT === image_bitmap.height, `ATLAS HEIGHT CHANGED (expected: ${ATLAS_HEIGHT} actual: ${image_bitmap.height})`);

    let canvas = new OffscreenCanvas(ATLAS_WIDTH, ATLAS_HEIGHT);
    canvas.getContext("2d")?.drawImage(image_bitmap, 0, 0);
    gl.upload_atlas_(canvas);

    for (let i: number = 33; i <= 96; i++)
    {
      character_code_map[String.fromCharCode(i)] = i;
      let y = i < 65 ? 0 : 8;
      let x = y === 8 ? (i - 65) * 8 : (i - 33) * 8;
      TEXTURE_CACHE[100 + i] = make_texture(8, 8, x / ATLAS_WIDTH, y / ATLAS_HEIGHT, (x + 8) / ATLAS_WIDTH, (y + 8) / ATLAS_HEIGHT);
    }

    for (let texture of texture_definitions)
    {
      let [def_type, id, x, y, w, h] = texture;
      if (def_type === TEXTURE_TYPE_SPRITE)
      {
        TEXTURE_CACHE[id[0]] = make_texture(w, h, x / ATLAS_WIDTH, y / ATLAS_HEIGHT, (x + w) / ATLAS_WIDTH, (y + h) / ATLAS_HEIGHT);
      }
      else // TEXTURE_TYPE_SPRITE_STRIP
      {
        for (let offset_x: number = x, i: number = 0; offset_x < ATLAS_WIDTH; offset_x += w)
          TEXTURE_CACHE[id[i++]] = make_texture(w, h, offset_x / ATLAS_WIDTH, y / ATLAS_HEIGHT, (offset_x + w) / ATLAS_WIDTH, (y + h) / ATLAS_HEIGHT);
      }
    }
    resolve();
  });
};