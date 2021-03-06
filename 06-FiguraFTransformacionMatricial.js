//-------------------------------------
//----------VertexShader---------------
//-------------------------------------
vert_shader = glsl`
    attribute vec3 a_position;
    uniform mat3 u_matrix;
 
    void main() {
        vec3 position = u_matrix * a_position;
        gl_Position = vec4(position.xy, 0.0, 1.0);
    }

`;

//-------------------------------------
//----------FragmentShader-------------
//-------------------------------------
frag_shader = glsl`
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
    var canvas = document.getElementById("canvas_07");
    var gl = canvas.getContext("webgl");
    var program = createProgramFromShaders(gl, vert_shader, frag_shader);
    gl.useProgram(program);

    //Crear Uniforme de Color para toda la figura
    var colorUniformLocation = gl.getUniformLocation(program, "u_color")
    gl.uniform4f(colorUniformLocation, 1, 0, 0.5, 1);

    //Crear Buffer de Geometria con coordenadas definidas
    var positionAttributeLocation = gl.getAttribLocation(program, "a_position")
    var positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const f = createF(0, 0, 0.3, 0.5, 0.08);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(f), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    //Crear uniforme con matriz de transformacion (Tx,Ty,  Sx,Sy,  R)
    const matrix = getMatrix2D(0.1, -0.1, -2, 2, Math.PI*0.3);
    var translateUniformLocation = gl.getUniformLocation(program, "u_matrix")
    gl.uniformMatrix3fv(translateUniformLocation, false, matrix);

    //Definir propiedades de la pantalla
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(1,1,1,1)
    gl.clear(gl.COLOR_BUFFER_BIT);

    //Llamado de Dibujo
    gl.drawArrays(gl.TRIANGLES, 0, f.length/2)
}
