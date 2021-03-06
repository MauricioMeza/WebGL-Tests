//-------------------------------------
//----------VertexShader---------------
//-------------------------------------
vert_shader = glsl`
    attribute vec4 a_position;
    attribute vec2 a_tex_coord;
    uniform mat4 u_matrix_perspective;
    uniform mat4 u_matrix_view;
    uniform mat4 u_matrix_transform;
    varying vec2 v_tex_coord;

    void main() {
        v_tex_coord = a_tex_coord;
        gl_Position = u_matrix_perspective * u_matrix_view * u_matrix_transform * a_position;
    }

`;

//-------------------------------------
//----------FragmentShader-------------
//-------------------------------------
frag_shader = glsl`
    precision mediump float;
    varying vec2 v_tex_coord;

    uniform sampler2D u_texture;

    void main() {
        gl_FragColor = texture2D(u_texture, v_tex_coord); 
    }
`;

//-------------------------------------
//----------WebGL_JS_Code-------------
//-------------------------------------
main();
//Main Function
function main(){
    //Cargar el canvas y los shaders
    var canvas = document.getElementById("canvas_16");
    var gl = canvas.getContext("webgl");
    var program = createProgramFromShaders(gl, vert_shader, frag_shader);
    gl.useProgram(program);


    //Crear Buffer de Coordenadas de Textura (Coordenadas UV)
    var colorAttributeLocation = gl.getAttribLocation(program, "a_tex_coord")
    var colorBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
    const cubeUVs = create3DCubeTexCoords();
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeUVs), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(colorAttributeLocation);
    gl.vertexAttribPointer(colorAttributeLocation, 2, gl.FLOAT, false, 0, 0)
    
    //Crear Buffer de Geometria
    var positionAttributeLocation = gl.getAttribLocation(program, "a_position")
    var positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const cube = create3DCube();
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cube), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    //Crear Uniforme con Matriz de Perspectiva (Near, Far, FOV)
    const viewMatrix = getMatrix3DView(0, 0, 0,   -0.5, 0,  1);
    var viewUniformLocation = gl.getUniformLocation(program, "u_matrix_view");
    gl.uniformMatrix4fv(viewUniformLocation, false, viewMatrix);


    //----------DEFINIR TEXTURAS----------
    //Crear Textura de Cuy
    var cuyTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, cuyTexture);
    var image = new Image();
    image.src = "cuy.jpg";
    image.addEventListener('load', () => {
        gl.bindTexture(gl.TEXTURE_2D, cuyTexture);
        //Ajusting texture to WebGL power of 2
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);
    })

    //Crear Textura donde se renderizara la escena
    var targetTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, targetTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 256, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    //Definir frame buffer
    var frameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, targetTexture, 0)
          
    //Definir Propiedades de la Pantalla y Modo de Renderizacion
    gl.enable(gl.DEPTH_TEST) 
    gl.enable(gl.CULL_FACE)  
    

    //-------- DRAW --------
    var Ry = 0;
    requestAnimationFrame(anim);
    function anim(){
        Ry += 0.01;
        //Render en el Frame Buffer con textura de imagen y fondo azul
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
        gl.bindTexture(gl.TEXTURE_2D, cuyTexture);
        gl.viewport(0, 0, 256, 256);
        gl.clearColor(0,0,1,1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        drawCube();

        //Render en el Canvas con textura de buffer y fondo azul
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, targetTexture);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(1,1,1,1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        drawCube();
        
        requestAnimationFrame(anim);
    }   
    
    function drawCube(){
        //Define Perspective Matrix
        for(var i=0; i<3; i++){
            aspect = gl.canvas.width/gl.canvas.height
            //Cargar Uniforme (Matriz de Perspectiva) segun aspecto del render (near, far, fov, aspect)
            const perspectiveMatrix = getMatrix3DPerspective(0.01, 100, 0.85, aspect);
            var perspectiveUniformLocation = gl.getUniformLocation(program, "u_matrix_perspective")
            gl.uniformMatrix4fv(perspectiveUniformLocation, false, perspectiveMatrix);

            //Cargar Uniforme (Matriz de Tranformacion) cambiante (Tx,Ty,Tz, Sx,Sy,Sz, Rx,Ry,Rz)
            const transformMatrix = getMatrix3DTransform(-0.5+(i/2), -0.5+(i/2), 0,   1.5, 1.5, 1.5,   0, Ry, 0);
            var translateUniformLocation = gl.getUniformLocation(program, "u_matrix_transform")
            gl.uniformMatrix4fv(translateUniformLocation, false, transformMatrix);
            
            //Dibujar todos los triangulos del objeto en un solo Draw Call
            gl.drawArrays(gl.TRIANGLES, 0, cube.length/3)
        }
    }
}

