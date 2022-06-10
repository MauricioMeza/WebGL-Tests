//-------------------------------------
//----------VertexShader---------------
//-------------------------------------
const glsl = x => x;
const vert_shader = glsl`
    //receive data from Buffer into gl_position (pos of current vertex)
    attribute vec2 a_position;
    uniform vec2 u_translation;
    uniform vec2 u_scaling;
    uniform vec2 u_rotating;
 
    void main() {
        vec2 translate =  a_position + u_translation;
        vec2 scale = vec2(translate.x * u_scaling.x, translate.y * u_scaling.y);
        vec2 rotate = vec2( scale.x * u_rotating.y + scale.y * u_rotating.x,
                            scale.y * u_rotating.y - scale.x * u_rotating.x);
        vec4 position = vec4(rotate, 0.0, 1.0);
        gl_Position = position;
    }

`;

//-------------------------------------
//----------FragmentShader-------------
//-------------------------------------
const frag_shader = glsl`

precision mediump float;
     //Turn pixel into the uniform color
    uniform vec4 u_color; 

    void main() {
    gl_FragColor = u_color; 
    }
`;

//-------------------------------------
//----------WebGL_JS_Code-------------
//-------------------------------------
main();
//Main Function
function main(){
    //Get canvas, context and programs
    var canvas = document.getElementById("canvas");
    var gl = canvas.getContext("webgl");
    var program = createProgramFromShaders(gl, vert_shader, frag_shader);
    gl.useProgram(program);

    //Create info buffer
    var colorUniformLocation = gl.getUniformLocation(program, "u_color")
    gl.uniform4f(colorUniformLocation, 1, 0, 0.5, 1);

    
    var translateUniformLocation = gl.getUniformLocation(program, "u_translation")
    gl.uniform2f(translateUniformLocation, 0.0, 0.0);
    var scaleUniformLocation = gl.getUniformLocation(program, "u_scaling")
    gl.uniform2f(scaleUniformLocation, -1.0, 1.0);
    var rotateUniformLocation = gl.getUniformLocation(program, "u_rotating")
    var rot = Math.PI;
    gl.uniform2f(rotateUniformLocation, Math.sin(rot), Math.cos(rot));
    var positionAttributeLocation = gl.getAttribLocation(program, "a_position")
    var positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const f = createF(0, 0, 0.3, 0.5, 0.08);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(f), gl.STATIC_DRAW);  
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    
    //Deifine Screen
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0,0,0,0)
    gl.clear(gl.COLOR_BUFFER_BIT);

    //Draw
    gl.drawArrays(gl.TRIANGLES, 0, f.length/2)
}