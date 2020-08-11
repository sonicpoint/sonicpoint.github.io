import { VertexShader } from "../../vertexShader.js";
import { FragmentShader } from '../../fragmentShader.js';
import { Program } from "../program.js";
import * as mat4 from "../../utils/gl-matrix/mat4.js";
export class SimplePomTestProgram extends Program {
    constructor(glCtx, geometry, colour, textureImage, normalMapImage, depthMapImage, layers, depthScale) {
        super(glCtx, new VertexShader(glCtx, SimplePomTestProgram.vertexShaderSource), new FragmentShader(glCtx, SimplePomTestProgram.fragmentShaderSource));
        this.geometry = geometry;
        this.colour = colour;
        this.textureImage = textureImage;
        this.normalMapImage = normalMapImage;
        this.depthMapImage = depthMapImage;
        this.layers = layers;
        this.depthScale = depthScale;
        this.colour = colour || [1.0, 1.0, 1.0, 1.0];
        this.layers = layers ? layers : 32;
        this.depthScale = depthScale ? depthScale : 0.08;
        this.glTexture = this.glCtx.createTexture();
        this.ambient = 0;
        this.bindBuffers();
    }
    bindBuffers() {
        this.createAttribute("vert_pos");
        this.createAttribute("vert_tang");
        this.createAttribute("vert_bitang");
        this.createAttribute("vert_uv");
        this.createUniform("model_mtx");
        this.createUniform("norm_mtx");
        this.createUniform("proj_mtx");
        this.createUniform("uLightPos");
        this.createUniform("tex_norm");
        this.createUniform("tex_diffuse");
        this.createUniform("tex_depth");
        this.createUniform("type");
        this.createUniform("depth_scale");
        this.createUniform("num_layers");
        this.createUniform("show_tex");
        this.glCtx.enableVertexAttribArray(this.attributes.get("vert_pos"));
        this.glCtx.enableVertexAttribArray(this.attributes.get("vert_tang"));
        this.glCtx.enableVertexAttribArray(this.attributes.get("vert_bitang"));
        this.glCtx.enableVertexAttribArray(this.attributes.get("vert_uv"));
        // Init meshes
        {
            // Positions
            this.vbo_pos = this.glCtx.createBuffer();
            this.glCtx.bindBuffer(this.glCtx.ARRAY_BUFFER, this.vbo_pos);
            const verts = this.geometry.vertexArray;
            this.glCtx.bufferData(this.glCtx.ARRAY_BUFFER, new Float32Array(verts), this.glCtx.STATIC_DRAW);
            // Tangents
            this.vbo_tang = this.glCtx.createBuffer();
            this.glCtx.bindBuffer(this.glCtx.ARRAY_BUFFER, this.vbo_tang);
            const tangs = this.geometry.tangentArray;
            this.glCtx.bufferData(this.glCtx.ARRAY_BUFFER, new Float32Array(tangs), this.glCtx.STATIC_DRAW);
            // Bitangents
            this.vbo_bitang = this.glCtx.createBuffer();
            this.glCtx.bindBuffer(this.glCtx.ARRAY_BUFFER, this.vbo_bitang);
            const bitangs = this.geometry.bitangentArray;
            this.glCtx.bufferData(this.glCtx.ARRAY_BUFFER, new Float32Array(bitangs), this.glCtx.STATIC_DRAW);
            // UVs
            this.vbo_uv = this.glCtx.createBuffer();
            this.glCtx.bindBuffer(this.glCtx.ARRAY_BUFFER, this.vbo_uv);
            const uvs = this.geometry.textureArray;
            this.glCtx.bufferData(this.glCtx.ARRAY_BUFFER, new Float32Array(uvs), this.glCtx.STATIC_DRAW);
            this.index_buffer = this.glCtx.createBuffer();
            this.glCtx.bindBuffer(this.glCtx.ELEMENT_ARRAY_BUFFER, this.index_buffer);
            const indices = this.geometry.indexArray;
            this.glCtx.bufferData(this.glCtx.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.glCtx.STATIC_DRAW);
            this.num_indices = indices.length;
        }
        // Init textures
        this.tex_norm = this.load_texture(this.normalMapImage);
        this.tex_diffuse = this.load_texture(this.textureImage);
        this.tex_depth = this.load_texture(this.depthMapImage);
    }
    load_texture(image) {
        var tex = this.glCtx.createTexture();
        this.glCtx.bindTexture(this.glCtx.TEXTURE_2D, tex);
        this.glCtx.texImage2D(this.glCtx.TEXTURE_2D, 0, this.glCtx.RGBA, 1, 1, 0, this.glCtx.RGBA, this.glCtx.UNSIGNED_BYTE, new Uint8Array([255, 0, 0, 255])); // red
        this.glCtx.bindTexture(this.glCtx.TEXTURE_2D, tex);
        this.glCtx.texImage2D(this.glCtx.TEXTURE_2D, 0, this.glCtx.RGBA, this.glCtx.RGBA, this.glCtx.UNSIGNED_BYTE, image);
        this.glCtx.texParameteri(this.glCtx.TEXTURE_2D, this.glCtx.TEXTURE_MAG_FILTER, this.glCtx.LINEAR);
        this.glCtx.texParameteri(this.glCtx.TEXTURE_2D, this.glCtx.TEXTURE_MIN_FILTER, this.glCtx.LINEAR);
        return tex;
    }
    //
    // World matrix will affect the normals (doesn't include projection or camera view)
    //
    execute(viewMatrixX, modelMatrixX, lighting, camera, drawMode) {
        // camera: Camera, lighting: Lighting, material: Material, matrix: number[], worldMatrix: number[],
        // drawMode: number) {
        this.glCtx.useProgram(this.glProgram);
        const viewMatrix = [];
        mat4.invert(viewMatrix, camera.matrix);
        const modelMatrix = viewMatrix;
        const projectionMatrix = [];
        mat4.copy(projectionMatrix, camera.projectionMatrix);
        mat4.multiply(projectionMatrix, projectionMatrix, modelMatrix);
        const inverseTranspose = [];
        mat4.invert(inverseTranspose, modelMatrix);
        mat4.transpose(inverseTranspose, inverseTranspose);
        this.glCtx.uniformMatrix4fv(this.uniforms.get("model_mtx"), false, modelMatrix);
        this.glCtx.uniformMatrix4fv(this.uniforms.get("norm_mtx"), false, inverseTranspose);
        this.glCtx.uniformMatrix4fv(this.uniforms.get("proj_mtx"), false, projectionMatrix);
        const lightSourceDir = [0, 10, 10];
        //    vec3.multiply(lightSourceDir, lighting.directionalLights[0].lightDirection, [50, 50, 50]);
        this.glCtx.uniform3fv(this.uniforms.get("uLightPos"), new Float32Array(lightSourceDir));
        this.glCtx.activeTexture(this.glCtx.TEXTURE0);
        this.glCtx.bindTexture(this.glCtx.TEXTURE_2D, this.tex_norm);
        this.glCtx.uniform1i(this.uniforms.get("tex_norm"), 0);
        this.glCtx.activeTexture(this.glCtx.TEXTURE1);
        this.glCtx.bindTexture(this.glCtx.TEXTURE_2D, this.tex_diffuse);
        this.glCtx.uniform1i(this.uniforms.get("tex_diffuse"), 1);
        this.glCtx.activeTexture(this.glCtx.TEXTURE2);
        this.glCtx.bindTexture(this.glCtx.TEXTURE_2D, this.tex_depth);
        this.glCtx.uniform1i(this.uniforms.get("tex_depth"), 2);
        this.glCtx.uniform1i(this.uniforms.get("type"), 4);
        const scale = 0.01 * parseFloat("0.1");
        this.glCtx.uniform1f(this.uniforms.get("depth_scale"), 0.1);
        this.glCtx.uniform1f(this.uniforms.get("num_layers"), 32);
        this.glCtx.uniform1i(this.uniforms.get("show_tex"), 1);
        // Bind vertices and indices
        this.glCtx.bindBuffer(this.glCtx.ARRAY_BUFFER, this.vbo_pos);
        this.glCtx.vertexAttribPointer(this.attributes.get("vert_pos"), 3, this.glCtx.FLOAT, false, 0, 0);
        this.glCtx.bindBuffer(this.glCtx.ARRAY_BUFFER, this.vbo_tang);
        this.glCtx.vertexAttribPointer(this.attributes.get("vert_tang"), 3, this.glCtx.FLOAT, false, 0, 0);
        this.glCtx.bindBuffer(this.glCtx.ARRAY_BUFFER, this.vbo_bitang);
        this.glCtx.vertexAttribPointer(this.attributes.get("vert_bitang"), 3, this.glCtx.FLOAT, false, 0, 0);
        this.glCtx.bindBuffer(this.glCtx.ARRAY_BUFFER, this.vbo_uv);
        this.glCtx.vertexAttribPointer(this.attributes.get("vert_uv"), 2, this.glCtx.FLOAT, false, 0, 0);
        this.glCtx.bindBuffer(this.glCtx.ELEMENT_ARRAY_BUFFER, this.index_buffer);
        this.glCtx.drawElements(this.glCtx.TRIANGLES, this.num_indices, this.glCtx.UNSIGNED_SHORT, 0);
        // Clean buffers
        this.glCtx.bindVertexArray(null);
        this.glCtx.bindBuffer(this.glCtx.ARRAY_BUFFER, null);
        this.glCtx.bindBuffer(this.glCtx.ELEMENT_ARRAY_BUFFER, null);
    }
}
SimplePomTestProgram.vertexShaderSource = `#version 300 es
    precision mediump float;

    precision highp float;

    in vec3 vert_pos;
    in vec3 vert_tang;
    in vec3 vert_bitang;
    in vec2 vert_uv;

    uniform mat4 model_mtx;
    uniform mat4 norm_mtx;
    uniform mat4 proj_mtx;
    uniform vec3 uLightPos;

    out vec2 frag_uv;
    out vec3 ts_light_pos; // Tangent space values
    out vec3 ts_view_pos;  //
    out vec3 ts_frag_pos;  //

    mat3 transposeX(in mat3 inMatrix)
    {
        vec3 i0 = inMatrix[0];
        vec3 i1 = inMatrix[1];
        vec3 i2 = inMatrix[2];

        mat3 outMatrix = mat3(
            vec3(i0.x, i1.x, i2.x),
            vec3(i0.y, i1.y, i2.y),
            vec3(i0.z, i1.z, i2.z)
        );

        return outMatrix;
    }

    void main(void)
    {
        gl_Position = proj_mtx * vec4(vert_pos, 1.0);
        ts_frag_pos = vec3(model_mtx * vec4(vert_pos, 1.0));
        vec3 vert_norm = cross(vert_bitang, vert_tang);

        vec3 t = normalize(mat3(norm_mtx) * vert_tang);
        vec3 b = normalize(mat3(norm_mtx) * vert_bitang);
        vec3 n = normalize(mat3(norm_mtx) * vert_norm);
        mat3 tbn = transposeX(mat3(t, b, n));

        ts_light_pos = tbn * uLightPos;
        // Our camera is always at the origin
        ts_view_pos = tbn * vec3(0, 0, 0);
        ts_frag_pos = tbn * ts_frag_pos;

        frag_uv = vert_uv;
    }`;
SimplePomTestProgram.fragmentShaderSource = `#version 300 es
    precision mediump float;

    uniform sampler2D tex_norm;
    uniform sampler2D tex_diffuse;
    uniform sampler2D tex_depth;
    /*
        The type is controlled by the radio buttons below the canvas.
        0 = No bump mapping
        1 = Normal mapping
        2 = Parallax mapping
        3 = Steep parallax mapping
        4 = Parallax occlusion mapping
    */
    uniform int type;
    uniform int show_tex;
    uniform float depth_scale;
    uniform float num_layers;

    in vec2 frag_uv;
    in vec3 ts_light_pos;
    in vec3 ts_view_pos;
    in vec3 ts_frag_pos;

    out vec4 fragColor;

    vec2 parallax_uv(vec2 uv, vec3 view_dir)
    {
        if (type == 2) {
            // Parallax mapping
            float depth = texture(tex_depth, uv).r;
            vec2 p = view_dir.xy * (depth * depth_scale) / view_dir.z;
            return uv - p;
        } else {
            float layer_depth = 1.0 / num_layers;
            float cur_layer_depth = 0.0;
            vec2 delta_uv = view_dir.xy * depth_scale / (view_dir.z * num_layers);
            vec2 cur_uv = uv;

            // float depth_from_tex = 1.0 - texture(tex_depth, cur_uv).r;
            float depth_from_tex = texture(tex_depth, cur_uv).r;

            for (int i = 0; i < 32; i++) {
                cur_layer_depth += layer_depth;
                cur_uv -= delta_uv;
                // depth_from_tex = 1.0 - texture(tex_depth, cur_uv).r;
                depth_from_tex = texture(tex_depth, cur_uv).r;
                if (depth_from_tex < cur_layer_depth) {
                    break;
                }
            }

            if (type == 3) {
                // Steep parallax mapping
                return cur_uv;
            } else {
                // Parallax occlusion mapping
                vec2 prev_uv = cur_uv + delta_uv;
                float next = depth_from_tex - cur_layer_depth;
                float prev = texture(tex_depth, prev_uv).r - cur_layer_depth
                + layer_depth;
               // float prev = (1.0 - texture(tex_depth, prev_uv).r) - cur_layer_depth
                //              + layer_depth;
                float weight = next / (next - prev);
                return mix(cur_uv, prev_uv, weight);
            }
        }
    }

    void main(void)
    {
        vec3 light_dir = normalize(ts_light_pos - ts_frag_pos);
        vec3 view_dir = normalize(ts_view_pos - ts_frag_pos);

        // Only perturb the texture coordinates if a parallax technique is selected
        vec2 uv = (type < 2) ? frag_uv : parallax_uv(frag_uv, view_dir);

        vec3 albedo = texture(tex_diffuse, uv).rgb;
        if (show_tex == 0) { albedo = vec3(1,1,1); }
        vec3 ambient = 0.3 * albedo;

        if (type == 0) {
            // No bump mapping
            vec3 norm = vec3(0,0,1);
            float diffuse = max(dot(light_dir, norm), 0.0);
            fragColor = vec4(diffuse * albedo + ambient, 1.0);

        } else {
            // Normal mapping
            vec3 norm = normalize(texture(tex_norm, uv).rgb * 2.0 - 1.0);
            float diffuse = max(dot(light_dir, norm), 0.0);
            fragColor = vec4(diffuse * albedo + ambient, 1.0);
        }
    }`;
//# sourceMappingURL=simplePomTestProgram.js.map