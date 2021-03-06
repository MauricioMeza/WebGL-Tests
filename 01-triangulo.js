//-------------------------------------
//----------VertexShader---------------
//-------------------------------------
const glsl = x => x;
var vert_shader = glsl`
    attribute vec4 a_position;
 
    void main() {
        gl_Position = a_position;
    }

`;

//-------------------------------------
//----------FragmentShader-------------
//-------------------------------------
var frag_shader = glsl`
    precision mediump float;
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
    //Cargar el canvas y los shaders
    var canvas = document.getElementById("canvas_01");
    var gl = canvas.getContext("webgl");
    var program = createProgramFromShaders(gl, vert_shader, frag_shader);
    gl.useProgram(program);

    //Definir Uniforme de Color
    var colorUniformLocation = gl.getUniformLocation(program, "u_color")
    gl.uniform4fv(colorUniformLocation, [1, 0, 0.5, 1]);

    //Definir Buffer de Coordenadas
    var positionAttributeLocation = gl.getAttribLocation(program, "a_position")
    var positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    var positions = [
        0, 0,
        0, 0.5,
        0.7, 0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    
    //Definir propiedades de la pantalla
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(1,1,1,1)
    gl.clear(gl.COLOR_BUFFER_BIT);

    //Dibujar en modo triangulos con 3 vertices
    gl.drawArrays(gl.TRIANGLES, 0, 3)
}

