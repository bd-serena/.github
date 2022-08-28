const animateEffect1 = function (canvas) {
  let ctx = canvas.getContext("2d");
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  let cx = canvas.width / 2;
  let cy = canvas.height / 2;
  let pi = Math.PI;
  let playerZ = -25;
  let playerX = 0;
  let playerY = 0;
  let pitch = 0;
  let yaw = 0;
  let scale = 500;
  let seedTimer = 0;
  let seedInterval = 5;
  let seedLife = 100;
  let gravity = 0.02;
  let seeds = [];
  let sparkPics = [];
  for (let i = 1; i <= 10; ++i) {
    let sparkPic = new Image();
    sparkPic.src = "";
    sparkPics.push(sparkPic);
  }
  let sparks = [];
  let frames = 0;

  function rasterizePoint(x, y, z) {
    let p, d;
    x -= playerX;
    y -= playerY;
    z -= playerZ;
    p = Math.atan2(x, z);
    d = Math.sqrt(x * x + z * z);
    x = Math.sin(p - yaw) * d;
    z = Math.cos(p - yaw) * d;
    p = Math.atan2(y, z);
    d = Math.sqrt(y * y + z * z);
    y = Math.sin(p - pitch) * d;
    z = Math.cos(p - pitch) * d;
    let rx1 = -1000; let ry1 = 1; let rx2 = 1000; let ry2 = 1; let rx3 = 0; let ry3 = 0; let rx4 = x; let ry4 = z; let uc = (ry4 - ry3) * (rx2 - rx1) - (rx4 - rx3) * (ry2 - ry1);
    if (!uc) return { x: 0, y: 0, d: -1 };
    let ua = ((rx4 - rx3) * (ry1 - ry3) - (ry4 - ry3) * (rx1 - rx3)) / uc;
    let ub = ((rx2 - rx1) * (ry1 - ry3) - (ry2 - ry1) * (rx1 - rx3)) / uc;
    if (!z) z = 0.000000001;
    if (ua > 0 && ua < 1 && ub > 0 && ub < 1) {
      return {
        x: cx + (rx1 + ua * (rx2 - rx1)) * scale,
        y: cy + y / z * scale,
        d: Math.sqrt(x * x + y * y + z * z)
      };
    } else {
      return {
        x: cx + (rx1 + ua * (rx2 - rx1)) * scale,
        y: cy + y / z * scale,
        d: -1
      };
    }
  }

  function spawnSeed() {
    let seed = {};
    seed.x = -50 + Math.random() * 100;
    seed.y = 25;
    seed.z = -50 + Math.random() * 100;
    seed.vx = 0.1 - Math.random() * 0.2;
    seed.vy = -1.5;//* (1+Math.random()/2);
    seed.vz = 0.1 - Math.random() * 0.2;
    seed.born = frames;
    seeds.push(seed);
  }

  function doLogic() {
    if (seedTimer < frames) {
      seedTimer = frames + seedInterval * Math.random() * 10;
      spawnSeed();
    }
    for (let i = 0; i < seeds.length; ++i) {
      seeds[i].vy += gravity;
      seeds[i].x += seeds[i].vx;
      seeds[i].y += seeds[i].vy;
      seeds[i].z += seeds[i].vz;
      if (frames - seeds[i].born > seedLife) {
        seeds.splice(i, 1);
      }
    }
    for (let i = 0; i < sparks.length; ++i) {
      if (sparks[i].alpha > 0 && sparks[i].radius > 5) {
        sparks[i].alpha -= 0.01;
        sparks[i].radius /= 1.02;
        sparks[i].vy += gravity;
        let point = {};
        point.x = sparks[i].x;
        point.y = sparks[i].y;
        point.z = sparks[i].z;
        if (sparks[i].trail.length) {
          let x = sparks[i].trail[sparks[i].trail.length - 1].x;
          let y = sparks[i].trail[sparks[i].trail.length - 1].y;
          let z = sparks[i].trail[sparks[i].trail.length - 1].z;
          let d = ((point.x - x) * (point.x - x) + (point.y - y) * (point.y - y) + (point.z - z) * (point.z - z));
          if (d > 9) {
            sparks[i].trail.push(point);
          }
        } else {
          sparks[i].trail.push(point);
        }
        if (sparks[i].trail.length > 5) sparks[i].trail.splice(0, 1);
        sparks[i].x += sparks[i].vx;
        sparks[i].y += sparks[i].vy;
        sparks[i].z += sparks[i].vz;
        sparks[i].vx /= 1.075;
        sparks[i].vy /= 1.075;
        sparks[i].vz /= 1.075;
      } else {
        sparks.splice(i, 1);
      }
    }
    let p = Math.atan2(playerX, playerZ);
    let d = Math.sqrt(playerX * playerX + playerZ * playerZ);
    d += Math.sin(frames / 80) / 3.25;
    let t = Math.sin(frames / 200) / 300;
    playerX = Math.sin(p + t) * d;
    playerZ = Math.cos(p + t) * d;
    yaw = pi + p + t;
  }

  function draw() {
    ctx.clearRect(0, 0, cx * 2, cy * 2);
    ctx.fillStyle = "#fff";
    for (let i = -100; i < 100; i += 3) {
      for (let j = -100; j < 100; j += 4) {
        let x = i; let z = j; let y = 25;
        let point = rasterizePoint(x, y, z);
        if (point.d !== -1) {
          let size = 250 / (1 + point.d);
          let d = Math.sqrt(x * x + z * z);
          let a = 0.75 - Math.pow(d / 100, 6) * 0.75;
          if (a > 0) {
            ctx.globalAlpha = a;
            ctx.fillRect(point.x - size / 2, point.y - size / 2, size, size);
          }
        }
      }
    }
    ctx.globalAlpha = 1;
    for (let i = 0; i < seeds.length; ++i) {
      let point = rasterizePoint(seeds[i].x, seeds[i].y, seeds[i].z);
      if (point.d !== -1) {
        let size = 0;
        ctx.fillRect(point.x - size / 2, point.y - size / 2, size, size);
      }
    }
    let point1 = {};
    for (let i = 0; i < sparks.length; ++i) {
      let point = rasterizePoint(sparks[i].x, sparks[i].y, sparks[i].z);
      if (point.d !== -1) {
        if (sparks[i].alpha < 0) sparks[i].alpha = 0;
        if (sparks[i].trail.length) {
          point1.x = point.x;
          point1.y = point.y;
          switch (sparks[i].img) {
          case sparkPics[0]: ctx.strokeStyle = "#f84"; break;
          case sparkPics[1]: ctx.strokeStyle = "#84f"; break;
          case sparkPics[2]: ctx.strokeStyle = "#8ff"; break;
          case sparkPics[3]: ctx.strokeStyle = "#fff"; break;
          case sparkPics[4]: ctx.strokeStyle = "#4f8"; break;
          case sparkPics[5]: ctx.strokeStyle = "#f44"; break;
          case sparkPics[6]: ctx.strokeStyle = "#f84"; break;
          case sparkPics[7]: ctx.strokeStyle = "#84f"; break;
          case sparkPics[8]: ctx.strokeStyle = "#fff"; break;
          case sparkPics[9]: ctx.strokeStyle = "#44f"; break;
          }
          for (let j = sparks[i].trail.length - 1; j >= 0; --j) {
            let point2 = rasterizePoint(sparks[i].trail[j].x, sparks[i].trail[j].y, sparks[i].trail[j].z);
            if (point2.d !== -1) {
              ctx.globalAlpha = j / sparks[i].trail.length * sparks[i].alpha / 2;
              ctx.beginPath();
              ctx.moveTo(point1.x, point1.y);
              ctx.lineWidth = 1 + sparks[i].radius * 10 / (sparks[i].trail.length - j) / (1 + point2.d);
              ctx.lineTo(point2.x, point2.y);
              ctx.stroke();
              point1.x = point2.x;
              point1.y = point2.y;
            }
          }
        }
      }
    }
  }

  function frame() {
    if (frames > 100000) {
      seedTimer = 0;
      frames = 0;
    }
    frames++;
    draw();
    doLogic();
    requestAnimationFrame(frame);
  }

  window.addEventListener("resize", () => {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    cx = canvas.width / 2;
    cy = canvas.height / 2;
  });

  frame();
}
const animateEffect2 = function (canvas) {
  let rainbow = false;
  let HD = true;
  function starlings(n, r, t, o, e, u, i, f) {
    let a = f.onSetup;
    void 0 === a && (a = null);
    let v = f.onRepeat;
    void 0 === v && (v = null);
    let c = f.modifier;
    void 0 === c && (c = null);
    let l = f.perspective;
    void 0 === l && (l = 1);
    let d = f.pixelRatio;
    void 0 === d && (d = 1);
    let m = f.triangles;
    void 0 === m && (m = !1);
    let s; let p; let y = r.length;
    let w = function(n, r) {
      let t = s.createShader(n);
      let wr = s.shaderSource(t, r) || s.compileShader(t) || t;
      return wr;
    };
    let b = function() {
      for (let n = 0; n < o.length; n += 1) {
        for (var r = s.createBuffer(), e = o[n], u = e.data(0, 0).length, i = new Float32Array(t * y * u), f = 0; f < t; f += 1) {
          for (let a = e.data(f, t), v = f * y * u, l = 0; l < y; l += 1) {
            for (let d = 0; d < u; d += 1) {
              if (c !== null && e.name === c.attribute) {
                i[v] = c.value(i[v], a, d, l)
              } else {
                i[v] = a[d];
                v += 1;
              }
            }
          }
        }
        s.bindBuffer(s.ARRAY_BUFFER, r); s.bufferData(s.ARRAY_BUFFER, i, s.STATIC_DRAW);
        let m = s.getAttribLocation(p, o[n].name);
        s.enableVertexAttribArray(m); s.vertexAttribPointer(m, u, s.FLOAT, !1, !1, 0, 0)
      }
    };
    let A = function() {
      e.push({
        name: "uMVP",
        type: "mat4"
      });
      for (let n = 0; n < e.length; n += 1) {
        let r = s.getUniformLocation(p, e[n].name);
        e[n].location = r
      }
    };
    let F = {
      float: function(n, r) {
        return s.uniform1f(n, r)
      },
      vec2: function(n, r) {
        return s.uniform2fv(n, r)
      },
      vec3: function(n, r) {
        return s.uniform3fv(n, r)
      },
      vec4: function(n, r) {
        return s.uniform4fv(n, r)
      },
      mat2: function(n, r) {
        return s.uniformMatrix2fv(n, !1, r)
      },
      mat3: function(n, r) {
        return s.uniformMatrix3fv(n, !1, r)
      },
      mat4: function(n, r) {
        return s.uniformMatrix4fv(n, !1, r)
      }
    };
    let g = function() {
      s.clear(16640); s.useProgram(p); v !== null && v(s, p, e);
      for (let n = 0; n < e.length; n += 1) F[e[n].type](e[n].location, e[n].value);
      s.drawArrays(m ? s.TRIANGLES : s.POINTS, 0, y * t); requestAnimationFrame(g)
    };
    let h = function() {
      n.width = n.clientWidth * d; n.height = n.clientHeight * d;
      let r = s.drawingBufferWidth;
      let t = s.drawingBufferHeight;
      s.viewport(0, 0, r, t); e[e.length - 1].value = [l / (r / t), 0, 0, 0, 0, l, 0, 0, 0, 0, -1, -1, 0, 0, 1, 1]
    };
    s = n.getContext("webgl"); p = s.createProgram(); s.attachShader(p, w(s.VERTEX_SHADER, u)); s.attachShader(p, w(s.FRAGMENT_SHADER, i)); s.linkProgram(p); A(); h(); b(); a !== null && a(s); g(); window.addEventListener("resize", h, !1)
  }

  function initialize(vertices) {
    let pixelRatio = HD ? window.devicePixelRatio : 1;
    let rows = 90;
    let multiplier = rows * rows;
    let duration = 0.4;
    let geometry = [{
      x: 0,
      y: 0,
      z: 0
    }];
    let pointSize = (HD ? 6 : 2).toFixed(1);
    let step = 0.004;
    let size = 5;
    let attributes = [{
      name: "aPositionStart",
      data: function data(i, total) {
        return [size - (i % rows / rows + 0.5 / rows) * (size * 2), -1, (size - (Math.floor(i / rows) / rows + 0.5 / rows) * size * 2) * -1]
      }
    }, {
      name: "aControlPointOne",
      data: function data(i) {
        return [size - (i % rows / rows + 0.5 / rows) * (size * 2), -0.5 + getRandom(0.2), (size - (Math.floor(i / rows) / rows + 0.5 / rows) * size * 2) * -1]
      }
    }, {
      name: "aControlPointTwo",
      data: function data(i) {
        return [size - (i % rows / rows + 0.5 / rows) * (size * 2), -0.5 + getRandom(0.2), (size - (Math.floor(i / rows) / rows + 0.5 / rows) * size * 2) * -1]
      }
    }, {
      name: "aPositionEnd",
      data: function data(i) {
        return [size - (i % rows / rows + 0.5 / rows) * (size * 2), -1, (size - (Math.floor(i / rows) / rows + 0.5 / rows) * size * 2) * -1]
      }
    }, {
      name: "aOffset",
      data: function data(i) {
        return [i * ((1 - duration) / (multiplier - 1))]
      }
    }, {
      name: "aColor",
      data: function data(i, total) {
        return getHSL(rainbow ? i / total * 1.0 : 0.5 + i / total * 0.4, 0.5, 0.5)
      }
    }];
    let uniforms = [{
      name: "uProgress",
      type: "float",
      value: 0.8
    }];
    let vertexShader = "\n  attribute vec3 aPositionStart;\n  attribute vec3 aControlPointOne;\n  attribute vec3 aControlPointTwo;\n  attribute vec3 aPositionEnd;\n  attribute float aOffset;\n  attribute vec3 aColor;\n\n  uniform float uProgress;\n  uniform mat4 uMVP;\n\n  varying vec3 vColor;\n\n  vec3 bezier4(vec3 a, vec3 b, vec3 c, vec3 d, float t) {\n    return mix(mix(mix(a, b, t), mix(b, c, t), t), mix(mix(b, c, t), mix(c, d, t), t), t);\n  }\n\n  float easeInOutQuint(float t){\n    return t < 0.5 ? 16.0 * t * t * t * t * t : 1.0 + 16.0 * (--t) * t * t * t * t;\n  }\n\n  void main () {\n    float tProgress = easeInOutQuint(min(1.0, max(0.0, (uProgress - aOffset)) / " + duration + "));\n    vec3 newPosition = bezier4(aPositionStart, aControlPointOne, aControlPointTwo, aPositionEnd, tProgress);\n    gl_PointSize = " + pointSize + " + ((newPosition.y + 1.0) * 80.0);\n    gl_Position = uMVP * vec4(newPosition, 1.0);\n    vColor = aColor;\n  }\n";
    let fragmentShader = "\n  precision mediump float;\n\n  varying vec3 vColor;\n\n  void main() {\n     vec2 pc = 2.0 * gl_PointCoord - 1.0;\n     gl_FragColor = vec4(vColor, 1.0 - dot(pc, pc));\n  }\n";
    let onSetup = function onSetup(gl) {
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      gl.enable(gl.BLEND)
    };
    let onRepeat = function onRepeat() {
      rotateY(uniforms[uniforms.length - 1].value, 0.002);
      if (uniforms[0].value < 0) {
        uniforms[0].value = 1
      }
      uniforms[0].value -= step
    };
    let options = {
      onSetup: onSetup,
      onRepeat: onRepeat,
      pixelRatio: pixelRatio
    };
    starlings(canvas, geometry, multiplier, attributes, uniforms, vertexShader, fragmentShader, options)
  }
  function getRandom(value) {
    return Math.random() * value - value / 2
  }
  function rotateY(matrix, angle) {
    let sin = Math.sin(angle);
    let cos = Math.cos(angle);
    let clone = JSON.parse(JSON.stringify(matrix));
    matrix[0] = clone[0] * cos - clone[8] * sin;
    matrix[1] = clone[1] * cos - clone[9] * sin;
    matrix[2] = clone[2] * cos - clone[10] * sin;
    matrix[3] = clone[3] * cos - clone[11] * sin;
    matrix[8] = clone[0] * sin + clone[8] * cos;
    matrix[9] = clone[1] * sin + clone[9] * cos;
    matrix[10] = clone[2] * sin + clone[10] * cos;
    matrix[11] = clone[3] * sin + clone[11] * cos
  }
  function h2r(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * 6 * (2 / 3 - t);
    return p
  }
  function getHSL(h, s, l) {
    h = (h % 1 + 1) % 1;
    s = Math.max(0, Math.min(1, s));
    l = Math.max(0, Math.min(1, l));
    if (s === 0) return [l, l, l];
    let p = l <= 0.5 ? l * (1 + s) : l + s - l * s;
    let q = 2 * l - p;
    return [h2r(q, p, h + 1 / 3), h2r(q, p, h), h2r(q, p, h - 1 / 3)]
  }
  initialize();
}

export { animateEffect1, animateEffect2 }
