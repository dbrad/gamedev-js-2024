import { TEXTURE_CACHE } from '@root/_graphics/texture';
import { floor } from '@root/_math/math';

import { assert } from '@debug';
import { OFF_WHITE } from './colour';
import { queue_draw } from './draw';

export let character_code_map: { [key: string]: number; } = {};
export let push_text = (text: string | number, x: number, y: number, colour: number = OFF_WHITE, scale: number = 1, horizontal_align: number = TEXT_ALIGN_LEFT, vertical_align: number = TEXT_ALIGN_TOP): void =>
{
  text = (text + "").toUpperCase();
  let letter_size: number = 8 * scale;
  let line_jump: number = letter_size + (scale * 2);
  let lines: string[] = text.split("|");
  let line_count: number = lines.length;
  let total_height: number = (letter_size * line_count) + ((scale * 2) * (line_count - 1));
  let x_offset: number = 0;
  let y_offset: number = vertical_align === TEXT_ALIGN_MIDDLE ? floor(total_height / 2) : vertical_align === TEXT_ALIGN_BOTTOM ? total_height : 0;
  let alignment_offset: number = 0;
  let character_count: number = 0;
  let line_length: number = 0;

  for (let line of lines)
  {
    character_count = line.length;
    line_length = character_count * letter_size;
    if (horizontal_align === TEXT_ALIGN_CENTER)
    {
      alignment_offset = floor(line_length / 2);
    }
    else if (horizontal_align === TEXT_ALIGN_RIGHT)
    {
      alignment_offset = floor(line_length);
    }

    for (let letter of line)
    {
      if (letter !== " ")
      {
        assert(character_code_map[letter] !== undefined, `Undefined character ${letter} used.`);
        let t = TEXTURE_CACHE[100 + character_code_map[letter]];
        queue_draw(
          x + x_offset - alignment_offset, y - y_offset,
          t.w_, t.h_,
          scale, scale,
          t.u0_, t.v0_, t.u1_, t.v1_,
          colour,
          false, false
        );
      }
      x_offset += letter_size;
    }
    y += line_jump;
    x_offset = 0;
  }
};