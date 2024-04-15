
import { assert } from "@debug";
import main_fragment from "@shaders/main.frag";
import main_vertex from "@shaders/main.vert";

export namespace gl
{
  let context: WebGLRenderingContext;

  // xy + uv + colour
  let VERTEX_SIZE: number = (4 * 2 * 4) + (4);
  let MAX_BATCH: number = 10922;
  let VERTICES_PER_QUAD: number = 6;
  let VERTEX_DATA_SIZE: number = VERTEX_SIZE * MAX_BATCH * 4;
  let INDEX_DATA_SIZE: number = MAX_BATCH * (2 * VERTICES_PER_QUAD);

  let main_program: WebGLShader;
  let loc_m_vertex_attr: number;
  let loc_m_translate_attr: number;
  let loc_m_scale_attr: number;
  let loc_m_uv_attr: number;
  let loc_m_colour_attr: number;
  let loc_m_texture_uniform: WebGLUniformLocation | null;

  let vertex_data: ArrayBuffer = new ArrayBuffer(VERTEX_DATA_SIZE);
  let position_data: Float32Array = new Float32Array(vertex_data);
  let colour_data: Uint32Array = new Uint32Array(vertex_data);
  let index_data: Uint16Array = new Uint16Array(INDEX_DATA_SIZE);

  let index_buffer: WebGLBuffer;
  let vertex_buffer: WebGLBuffer;
  let batch_count: number = 0;

  export let initialize_ = (canvas: HTMLCanvasElement): void =>
  {
    {
      context = canvas.getContext("webgl2", { powerPreference: "high-performance", antialias: false, depth: false }) as WebGL2RenderingContext;
      assert(context !== undefined && context !== null, "No GL context created.");
    }

    let compile_shader_ = (source: string, type: number): WebGLShader =>
    {
      let shader = context.createShader(type);
      assert(shader !== null, "unable to created shader");
      context.shaderSource(shader, source);
      context.compileShader(shader);
      return shader;
    };

    let create_shader_program_ = (vsSource: string, fsSource: string): WebGLProgram =>
    {
      let program = context.createProgram();
      assert(program !== null, "unable to created program");
      let vShader: WebGLShader = compile_shader_(vsSource, GL_VERTEX_SHADER);
      let fShader: WebGLShader = compile_shader_(fsSource, GL_FRAGMENT_SHADER);
      context.attachShader(program, vShader);
      context.attachShader(program, fShader);
      context.linkProgram(program);
      return program;
    };

    let create_buffer_ = (bufferType: number, size: number, usage: number): WebGLBuffer =>
    {
      let buffer = context.createBuffer();
      assert(buffer !== null, "unable to created buffer");
      context.bindBuffer(bufferType, buffer);
      context.bufferData(bufferType, size, usage);
      return buffer;
    };

    // ==============================================================
    // MAIN PROGRAM SETUP
    // ==============================================================
    {
      main_program = create_shader_program_(main_vertex, main_fragment);
      context.useProgram(main_program);

      for (let indexA: number = 0, indexB: number = 0; indexA < MAX_BATCH * VERTICES_PER_QUAD; indexA += VERTICES_PER_QUAD, indexB += 4)
      {
        index_data[indexA + 0] = indexB;
        index_data[indexA + 1] = indexB + 1;
        index_data[indexA + 2] = indexB + 2;
        index_data[indexA + 3] = indexB + 0;
        index_data[indexA + 4] = indexB + 3;
        index_data[indexA + 5] = indexB + 1;
      }

      index_buffer = create_buffer_(GL_ELEMENT_ARRAY_BUFFER, index_data.byteLength, GL_STATIC_DRAW);
      context.bufferSubData(GL_ELEMENT_ARRAY_BUFFER, 0, index_data);

      vertex_buffer = create_buffer_(GL_ARRAY_BUFFER, vertex_data.byteLength, GL_DYNAMIC_DRAW);

      context.blendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
      context.enable(GL_BLEND);

      loc_m_vertex_attr = context.getAttribLocation(main_program, "v");
      loc_m_translate_attr = context.getAttribLocation(main_program, "t");
      loc_m_scale_attr = context.getAttribLocation(main_program, "s");
      loc_m_uv_attr = context.getAttribLocation(main_program, "u");
      loc_m_colour_attr = context.getAttribLocation(main_program, "c");

      loc_m_texture_uniform = context.getUniformLocation(main_program, "g");
    }

    context.activeTexture(GL_TEXTURE0);
    context.viewport(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    context.useProgram(main_program);

    context.bindBuffer(GL_ELEMENT_ARRAY_BUFFER, index_buffer);
    context.bindBuffer(GL_ARRAY_BUFFER, vertex_buffer);

    context.vertexAttribPointer(loc_m_vertex_attr, 2, GL_FLOAT, false, VERTEX_SIZE, 0);
    context.enableVertexAttribArray(loc_m_vertex_attr);

    context.vertexAttribPointer(loc_m_translate_attr, 2, GL_FLOAT, false, VERTEX_SIZE, 8);
    context.enableVertexAttribArray(loc_m_translate_attr);

    context.vertexAttribPointer(loc_m_scale_attr, 2, GL_FLOAT, false, VERTEX_SIZE, 16);
    context.enableVertexAttribArray(loc_m_scale_attr);

    context.vertexAttribPointer(loc_m_uv_attr, 2, GL_FLOAT, false, VERTEX_SIZE, 24);
    context.enableVertexAttribArray(loc_m_uv_attr);

    context.vertexAttribPointer(loc_m_colour_attr, 4, GL_UNSIGNED_BYTE, true, VERTEX_SIZE, 32);
    context.enableVertexAttribArray(loc_m_colour_attr);

    context.uniform1i(loc_m_texture_uniform, 0);
  };

  export let upload_atlas_ = (image: TexImageSource): void =>
  {
    context.activeTexture(GL_TEXTURE0);
    let texture = context.createTexture();
    assert(texture !== null, "Unable to create texture.");
    context.bindTexture(GL_TEXTURE_2D, texture);
    context.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
    context.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
    context.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
    context.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
    context.texImage2D(GL_TEXTURE_2D, 0, GL_RGBA, GL_RGBA, GL_UNSIGNED_BYTE, image);
  };

  export let set_clear_colour_ = (r: number, g: number, b: number): void =>
  {
    context.clearColor(r, g, b, 1);
  };

  export let flush_ = (): void =>
  {
    if (batch_count > 0)
    {
      context.bufferSubData(GL_ARRAY_BUFFER, 0, position_data.subarray(0, batch_count * VERTEX_SIZE));
      context.drawElements(GL_TRIANGLES, batch_count * VERTICES_PER_QUAD, GL_UNSIGNED_SHORT, 0);
      batch_count = 0;
    }
  };

  export let clear_ = (): void =>
  {
    context.clear(GL_COLOR_BUFFER_BIT);
  };

  export let push_quad_ = (x: number, y: number, w: number, h: number, tx: number, ty: number, sx: number, sy: number, u0: number, v0: number, u1: number, v1: number, colour: number): void =>
  {
    if (batch_count + 1 >= MAX_BATCH)
    {
      context.bufferSubData(GL_ARRAY_BUFFER, 0, vertex_data);
      context.drawElements(GL_TRIANGLES, batch_count * VERTICES_PER_QUAD, GL_UNSIGNED_SHORT, 0);
      batch_count = 0;
    }

    let offset: number = batch_count * VERTEX_SIZE;

    // Vertex Order
    // Vertex Position | Translation | Scale | UV | ABGR
    // Vertex 1
    position_data[offset++] = x;
    position_data[offset++] = y;
    position_data[offset++] = tx;
    position_data[offset++] = ty;
    position_data[offset++] = sx;
    position_data[offset++] = sy;
    position_data[offset++] = u0;
    position_data[offset++] = v0;
    colour_data[offset++] = colour;

    // Vertex 2
    position_data[offset++] = x + w;
    position_data[offset++] = y + h;
    position_data[offset++] = tx;
    position_data[offset++] = ty;
    position_data[offset++] = sx;
    position_data[offset++] = sy;
    position_data[offset++] = u1;
    position_data[offset++] = v1;
    colour_data[offset++] = colour;

    // Vertex 3
    position_data[offset++] = x;
    position_data[offset++] = y + h;
    position_data[offset++] = tx;
    position_data[offset++] = ty;
    position_data[offset++] = sx;
    position_data[offset++] = sy;
    position_data[offset++] = u0;
    position_data[offset++] = v1;
    colour_data[offset++] = colour;

    // Vertex 4
    position_data[offset++] = x + w;
    position_data[offset++] = y;
    position_data[offset++] = tx;
    position_data[offset++] = ty;
    position_data[offset++] = sx;
    position_data[offset++] = sy;
    position_data[offset++] = u1;
    position_data[offset++] = v0;
    colour_data[offset++] = colour;

    if (++batch_count >= MAX_BATCH)
    {
      context.bufferSubData(GL_ARRAY_BUFFER, 0, vertex_data);
      context.drawElements(GL_TRIANGLES, batch_count * VERTICES_PER_QUAD, GL_UNSIGNED_SHORT, 0);
      batch_count = 0;
    }
  };
}