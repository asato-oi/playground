"use strict";

import * as THREE from "three";

class ThreeApp {
  /**
   * レンダラーのパラメーター
   */
  static RENDERER_PARAM = {
    clearColor: 0x000,
    width: window.innerWidth,
    height: window.innerHeight,
  };

  /**
   * カメラのパラメーター
   */
  static CAMERA_PARAM = {
    fovY: 60,
    aspect: window.innerWidth / window.innerHeight,
    near: 0.1,
    far: 50.0,
    position: new THREE.Vector3(15.0, 6.0, 30.0),
    lookAt: new THREE.Vector3(0.0, 18.0, 0.0),
  };

  /**
   * 平行光源のパラメーター
   */
  static DIRECTIONAL_LIGHT_PARAM = {
    color: 0xffffff,
    intensity: 5,
    position: new THREE.Vector3(10.0, 3.0, 5.0),
  };

  /**
   * アンビエントライトのパラメーター
   */
  static AMBIENT_LIGHT_PARAM = {
    color: 0xffffff,
    intensity: 1,
  };

  /**
   * マテリアルのパラメーター
   */
  static MATERIAL_PARAM = {
    color: 0x1137bf, // マテリアルの基本色
  };

  /**
   * ヘルパーのパラメーター
   */
  static HELPER_PARAM = {
    axesHelper: 10.0,
  };

  renderer; // レンダラ
  scene; // シーン
  camera; // カメラ
  directionalLight; // 平行光源（ディレクショナルライト）
  ambientLight; // 環境光（アンビエントライト）
  pillarTop; // ジオメトリ（支柱上側）
  base; // ジオメトリ（土台部分）
  center; // ジオメトリ（中央）
  neck; // ジオメトリ（扇風機の首）
  neck2; // ジオメトリ（扇風機の首）
  blade1; // ジオメトリ（扇風機の羽1）
  blade2; // ジオメトリ（扇風機の羽2）
  blade3; // ジオメトリ（扇風機の羽3）
  bladeGroup; // 羽のグループ
  shakingGroup; // 首振りのグループ
  material; // マテリアル
  box; // ボックスメッシュ
  axesHelper; // 軸ヘルパー
  controls; // オービットコントロール

  rotationAngle = 0;
  rotationDirection = 1; // 回転方向（1: 正方向、-1: 逆方向）

  /**
   * コンストラクタ
   * @constructor
   * @param {HTMLElement} wrapper - canvas 要素を append する親要素
   */
  constructor(wrapper) {
    // レンダラー初期化
    const color = new THREE.Color(ThreeApp.RENDERER_PARAM.clearColor);

    this.renderer = new THREE.WebGLRenderer(); // アンチエイリアスを有効にする
    this.renderer.setPixelRatio(window.devicePixelRatio); // デバイスのピクセル比を設定
    this.renderer.setClearColor(color);
    this.renderer.setSize(
      ThreeApp.RENDERER_PARAM.width,
      ThreeApp.RENDERER_PARAM.height
    );
    wrapper.appendChild(this.renderer.domElement); //canvas

    // シーン初期化
    this.scene = new THREE.Scene();

    // カメラ
    this.camera = new THREE.PerspectiveCamera(
      ThreeApp.CAMERA_PARAM.fovY,
      ThreeApp.CAMERA_PARAM.aspect,
      ThreeApp.CAMERA_PARAM.near,
      ThreeApp.CAMERA_PARAM.far
    );
    this.camera.position.copy(ThreeApp.CAMERA_PARAM.position);
    this.camera.lookAt(ThreeApp.CAMERA_PARAM.lookAt);

    // ディレクショナルライト（平行光源）
    this.directionalLight = new THREE.DirectionalLight(
      ThreeApp.DIRECTIONAL_LIGHT_PARAM.color,
      ThreeApp.DIRECTIONAL_LIGHT_PARAM.intensity
    );
    this.directionalLight.position.copy(
      ThreeApp.DIRECTIONAL_LIGHT_PARAM.position
    );
    this.scene.add(this.directionalLight);

    // アンビエントライト（環境光）
    this.ambientLight = new THREE.AmbientLight(
      ThreeApp.AMBIENT_LIGHT_PARAM.color,
      ThreeApp.AMBIENT_LIGHT_PARAM.intensity
    );
    this.scene.add(this.ambientLight);

    // マテリアル
    this.material = new THREE.MeshToonMaterial(ThreeApp.MATERIAL_PARAM);

    // ジオメトリ（支柱上）
    const pillarTop = new THREE.CylinderGeometry(2, 4, 20.0, 32.0);
    // ジオメトリ（土台）
    const base = new THREE.CylinderGeometry(4.0, 10, 2, 64);
    // ジオメトリ（首）
    const neck = new THREE.CylinderGeometry(3, 3, 4, 32);
    const neck2 = new THREE.CylinderGeometry(5, 3.5, 10, 32);
    // ジオメトリ（中央）
    const center = new THREE.CapsuleGeometry(2, 2, 4, 32);
    // ジオメトリ（羽）
    const blade = new THREE.Shape();

    const x = -0.5;
    const y = -0.5;

    blade.moveTo(x, y);
    blade.bezierCurveTo(x + 1, y - 1, x + 3, y - 9, x, y - 11);
    blade.bezierCurveTo(x - 1, y - 12, x - 4, y - 12, x - 6, y - 11);
    blade.bezierCurveTo(x - 8, y - 10, x - 8, y - 10, x - 7, y - 8);
    blade.bezierCurveTo(x - 6, y - 6, x - 3, y - 2, x - 2, y - 1);
    blade.bezierCurveTo(x - 1, y, x - 1, y, x, y);

    const extrudeSettings = {
      steps: 2,
      depth: 0.1,
      bevelEnabled: false,
    };

    const bladeGeometry = new THREE.ExtrudeGeometry(blade, extrudeSettings);

    // メッシュ
    this.pillarTop = new THREE.Mesh(
      pillarTop,
      new THREE.MeshToonMaterial({ color: 0x800108 })
    );
    this.pillarTop.position.y = 10.0;
    this.base = new THREE.Mesh(
      base,
      new THREE.MeshToonMaterial({ color: 0xc4990a })
    );
    this.base.position.y = 1.0; // 土台の位置を調整
    this.neck = new THREE.Mesh(
      neck,
      new THREE.MeshToonMaterial({ color: 0x800108 })
    );
    this.neck.position.y = 20; // 首の位置を調整
    this.neck.position.z = 5; // 首の位置を調整
    this.neck.rotation.x = Math.PI / 2;
    this.neck2 = new THREE.Mesh(
      neck2,
      new THREE.MeshToonMaterial({ color: 0xc4990a })
    );
    this.neck2.position.y = 20; // 首の位置を調整
    this.neck2.rotation.x = Math.PI / 2;
    this.center = new THREE.Mesh(
      center,
      new THREE.MeshToonMaterial({ color: 0x800108 })
    );
    this.center.position.y = 20;
    this.center.rotation.x = Math.PI / 2;
    this.center.position.z = 7.5;

    this.bladeGroup = new THREE.Group();

    this.blade1 = new THREE.Mesh(bladeGeometry, this.material);

    this.blade1.rotation.x = Math.PI / 24;
    this.blade1.rotation.z = 90 * (Math.PI / 180); // 首の位置を調整

    this.blade2 = new THREE.Mesh(bladeGeometry, this.material);
    this.blade2.rotation.x = -Math.PI / 24;
    this.blade2.rotation.z = -90 * (Math.PI / 180);

    this.blade3 = new THREE.Mesh(bladeGeometry, this.material);
    this.blade3.rotation.y = Math.PI / 24;
    this.blade3.rotation.z = 180 * (Math.PI / 180);

    this.blade4 = new THREE.Mesh(bladeGeometry, this.material);
    this.blade4.rotation.y = -Math.PI / 24;

    this.bladeGroup.add(this.blade1);
    this.bladeGroup.add(this.blade2);
    this.bladeGroup.add(this.blade3);
    this.bladeGroup.add(this.blade4);

    this.bladeGroup.position.set(0, 20, 8);

    this.shakingGroup = new THREE.Group();

    this.shakingGroup.add(this.neck);
    this.shakingGroup.add(this.neck2);
    this.shakingGroup.add(this.center);
    this.shakingGroup.add(this.bladeGroup);

    this.scene.add(this.pillarTop);
    this.scene.add(this.base);
    this.scene.add(this.shakingGroup);

    this.render = this.render.bind(this);

    window.addEventListener("resize", () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    });
  }

  render() {
    // 恒常ループの設定
    requestAnimationFrame(this.render);

    this.bladeGroup.rotation.z += 0.04;

    // 120度の範囲で行ったり来たりするように回転角度を制限
    if (this.rotationAngle >= Math.PI / 4) {
      this.rotationDirection = -1; // 逆方向に回転
    } else if (this.rotationAngle <= -Math.PI / 4) {
      this.rotationDirection = 1; // 正方向に回転
    }

    // 回転角度を更新
    this.rotationAngle += 0.002 * this.rotationDirection;

    // shakingGroup の回転を更新
    this.shakingGroup.rotation.y = this.rotationAngle;

    // コントロールを更新
    this.renderer.render(this.scene, this.camera);
  }
}

(() => {
  const wrapper = document.querySelector("#webgl");

  const app = new ThreeApp(wrapper);
  app.render();
})();
