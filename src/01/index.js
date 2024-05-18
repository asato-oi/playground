"use strict";

import * as THREE from "three";

class ThreeApp {
  /**
   * レンダラーのパラメーター
   */
  static RENDERER_PARAM = {
    clearColor: 0x000000,
    width: window.innerWidth,
    height: window.innerHeight,
  };

  /**
   * カメラのパラメーター
   */
  static CAMERA_PARAM = {
    fovY: 45,
    aspect: window.innerWidth / window.innerHeight,
    near: 0.1,
    far: 10.0,
    position: new THREE.Vector3(-1.0, 0.1, 4.0),
    lookAt: new THREE.Vector3(0.6, 0.0, 0.0),

    radius: 3,
  };

  /**
   * 平行光源のパラメーター
   */
  static DIRECTIONAL_LIGHT_PARAM = {
    color: 0xfffffff,
    intensity: 30.0,
    position: new THREE.Vector3(-1.0, 2.0, -1.0),
  };

  /**
   * スポットライトのパラメーター
   */
  static SPOT_LIGHT_PARAM = {
    color: 0xf2f2f2,
    intensity: 100.0,
    distance: 8,
    angle: Math.PI / 4,
    penumbra: 1,
    decay: 0.5,
    position: new THREE.Vector3(1.0, 3.0, 5.0),
  };

  /**
   * アンビエントライトのパラメーター
   */
  static AMBIENT_LIGHT_PARAM = {
    color: 0xffffff,
    intensity: 0.3,
  };

  /**
   * マテリアルのパラメーター
   */
  static MATERIAL_PARAM = {
    color: 0x0052b0, // マテリアルの基本色
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
  xzAngle = 0; // カメラのx、z角度
  yAngle = 0; // カメラのy角度
  directionalLight; // 平行光源（ディレクショナルライト）
  spotLight;
  ambientLight; // 環境光（アンビエントライト）
  geometry; // ジオメトリ
  smallGeometry; // 小さいジオメトリ群
  material; // マテリアル
  box; // ボックスメッシュ
  smallBoxes = []; // 小さいボックスメッシュ群
  controls; //オービットコントロール
  axesHelper; // 軸ヘルパー

  /**
   * @constructor
   * @param {HTMLElement} wrapper canvas要素をappendする親要素
   */
  constructor(wrapper) {
    // レンダラー初期化
    const color = new THREE.Color(ThreeApp.RENDERER_PARAM.clearColor);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // アンチエイリアスを有効にする
    this.renderer.setPixelRatio(window.devicePixelRatio); // デバイスのピクセル比を設定
    this.renderer.setClearColor(color);
    this.renderer.setSize(
      ThreeApp.RENDERER_PARAM.width,
      ThreeApp.RENDERER_PARAM.height
    );
    wrapper.appendChild(this.renderer.domElement); //canvas

    // シーン初期化
    this.scene = new THREE.Scene();

    // カメラ初期化
    this.camera = new THREE.PerspectiveCamera(
      ThreeApp.CAMERA_PARAM.fovY,
      ThreeApp.CAMERA_PARAM.aspect,
      ThreeApp.CAMERA_PARAM.near,
      ThreeApp.CAMERA_PARAM.far
    );
    this.camera.position.copy(ThreeApp.CAMERA_PARAM.position);
    this.camera.lookAt(ThreeApp.CAMERA_PARAM.lookAt);
    this.camera.rotation.z = -Math.PI / 12; // 15度傾ける

    // ディレクショナルライト
    this.directionalLight = new THREE.DirectionalLight(
      ThreeApp.DIRECTIONAL_LIGHT_PARAM.color,
      ThreeApp.DIRECTIONAL_LIGHT_PARAM.intensity
    );
    this.directionalLight.position.copy(
      ThreeApp.DIRECTIONAL_LIGHT_PARAM.position
    );
    this.scene.add(this.directionalLight);

    //スポットライト
    this.spotLight = new THREE.SpotLight(
      ThreeApp.SPOT_LIGHT_PARAM.color,
      ThreeApp.SPOT_LIGHT_PARAM.intensity,
      ThreeApp.SPOT_LIGHT_PARAM.distance,
      ThreeApp.SPOT_LIGHT_PARAM.angle,
      ThreeApp.SPOT_LIGHT_PARAM.penumbra,
      ThreeApp.SPOT_LIGHT_PARAM.decay
    );
    this.spotLight.position.copy(ThreeApp.SPOT_LIGHT_PARAM.position);
    this.scene.add(this.spotLight);

    // スポットライトヘルパー
    // const pointLightHelper = new THREE.PointLightHelper(this.spotLight, 0.5);
    // this.scene.add(pointLightHelper);

    // アンビエントライト
    this.ambientLight = new THREE.AmbientLight(
      ThreeApp.AMBIENT_LIGHT_PARAM.color,
      ThreeApp.AMBIENT_LIGHT_PARAM.intensity
    );
    this.scene.add(this.ambientLight);

    // ジオメトリとマテリアル
    this.geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    this.smallGeometry = new THREE.BoxGeometry(0.018, 0.018, 0.018);
    this.material = new THREE.MeshPhongMaterial(ThreeApp.MATERIAL_PARAM);

    // 中心のボックスメッシュ
    this.box = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.box);

    // 小さいボックス群メッシュ
    const smallBoxTotalCount = 700;
    for (let i = 0; i < smallBoxTotalCount; ++i) {
      const smallBox = new THREE.Mesh(this.smallGeometry, this.material);
      let xPosition, yPosition, zPosition, theta, phi, distance;

      do {
        theta = Math.random() * 2 * Math.PI;
        phi = Math.acos(1 - 2 * Math.random());
        distance = 2 + Math.random() * 0.3;
        xPosition = distance * Math.sin(phi) * Math.cos(theta);
        yPosition = Math.random() * 0.2 - 0.1;
        zPosition = distance * Math.cos(phi);
      } while (
        xPosition > -1 &&
        xPosition < 1 &&
        zPosition > -1 &&
        zPosition < 1
      );

      smallBox.position.x = xPosition;
      smallBox.position.y = yPosition;
      smallBox.position.z = zPosition;

      this.smallBoxes.push(smallBox);
      this.scene.add(smallBox);
    }

    // ヘルパー
    // const axesBarLength = 10.0;
    // this.axesHelper = new THREE.AxesHelper(axesBarLength);
    // this.scene.add(this.axesHelper);

    window.addEventListener("resize", () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    });
  }

  render = () => {
    requestAnimationFrame(this.render);

    this.box.rotation.y += 0.001;
    this.box.rotation.x += 0.001;
    this.box.rotation.z += 0.001;

    for (const smallBox of this.smallBoxes) {
      smallBox.rotation.y += Math.random() * 0.05;
      smallBox.rotation.x += Math.random() * 0.05;
      smallBox.rotation.z += Math.random() * 0.05;
    }

    this.xzAngle -= 0.005;
    this.yAngle += 0.005;

    this.camera.position.x =
      ThreeApp.CAMERA_PARAM.radius * Math.cos(this.xzAngle);
    this.camera.position.z =
      ThreeApp.CAMERA_PARAM.radius * Math.sin(this.xzAngle);
    this.camera.position.y = Math.sin(this.yAngle * 2) * 0.2;

    this.camera.lookAt(ThreeApp.CAMERA_PARAM.lookAt);

    this.renderer.render(this.scene, this.camera);
  };
}

(() => {
  const wrapper = document.querySelector("#webgl");

  const app = new ThreeApp(wrapper);
  app.render();
})();
