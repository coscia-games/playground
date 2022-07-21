// 3d 2d points
export const P3 = (x = 0, y = 0, z = 0) => ({ x, y, z });
export const P2 = (x = 0, y = 0) => ({ x, y });

const D2R = (ang) => (ang - 90) * (Math.PI / 180);
const Ang2Vec = (ang, len = 1) => P2(Math.cos(D2R(ang)) * len, Math.sin(D2R(ang)) * len);

const projTypes = {
  PixelBimetric: {
    xAxis: P2(1, 0.5),
    yAxis: P2(-1, 0.5),
    zAxis: P2(0, -1),
    depth: P3(0.5, 0.5, 1), // projections have z as depth
  },
  PixelTrimetric: {
    xAxis: P2(1, 0.5),
    yAxis: P2(-0.5, 1),
    zAxis: P2(0, -1),
    depth: P3(0.5, 1, 1),
  },
  Isometric: {
    xAxis: Ang2Vec(120),
    yAxis: Ang2Vec(-120),
    zAxis: Ang2Vec(0),
  },
  Bimetric: {
    xAxis: Ang2Vec(116.57),
    yAxis: Ang2Vec(-116.57),
    zAxis: Ang2Vec(0),
  },
  Trimetric: {
    xAxis: Ang2Vec(126.87, 2 / 3),
    yAxis: Ang2Vec(-104.04),
    zAxis: Ang2Vec(0),
  },
  Military: {
    xAxis: Ang2Vec(135),
    yAxis: Ang2Vec(-135),
    zAxis: Ang2Vec(0),
  },
  Cavalier: {
    xAxis: Ang2Vec(135),
    yAxis: Ang2Vec(-90),
    zAxis: Ang2Vec(0),
  },
  TopDown: {
    xAxis: Ang2Vec(180),
    yAxis: Ang2Vec(-90),
    zAxis: Ang2Vec(0),
  },
};

// projection object
export const axoProjMat = {
  xAxis: P2(1, 0.5),
  yAxis: P2(-1, 0.5),
  zAxis: P2(0, -1),
  depth: P3(0.5, 0.5, 1), // projections have z as depth
  origin: P2(), // (0,0) default 2D point
  setProjection(name) {
    if (projTypes[name]) {
      Object.keys(projTypes[name]).forEach((key) => {
        this[key] = projTypes[name][key];
      });
      if (!projTypes[name].depth) {
        this.depth = P3(this.xAxis.y, this.yAxis.y, -this.zAxis.y);
      }
    }
  },
  project(p, retP = P3()) {
    retP.x = p.x * this.xAxis.x + p.y * this.yAxis.x + p.z * this.zAxis.x + this.origin.x;
    retP.y = p.x * this.xAxis.y + p.y * this.yAxis.y + p.z * this.zAxis.y + this.origin.y;
    retP.z = p.x * this.depth.x + p.y * this.depth.y + p.z * this.depth.z;
    return retP;
  },
};
