uniform vec2 uFrequency;
uniform float uTime;

varying vec2 vUv;
varying float vElevation;

void main()
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    float elevation = sin(modelPosition.x * uFrequency.x - uTime) * 0.05; // was 0.1
    elevation += sin(modelPosition.y * uFrequency.y - uTime) * 0.1; // was .1

    modelPosition.x += elevation * 0.85;
    modelPosition.y += elevation * 0.5;
    modelPosition.z += elevation * 0.1;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;

    vUv = uv;
    vElevation = elevation;
}