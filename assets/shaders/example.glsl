precision mediump float;

varying vec2 vTextureCoord;
uniform sampler2D uMainSampler;
uniform float uTime;

void main() {
  vec4 color = texture2D(uMainSampler, vTextureCoord);
  float brightness = sin(uTime * 100.0) * 0.5 + 0.5; // Мерцание между 0 и 1
  gl_FragColor = vec4(color.rgb * brightness, color.a);
}