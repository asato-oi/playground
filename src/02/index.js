"use strict";

import * as THREE from "three";
import { OrbitControls } from "./OrbitControls.js";

class ThreeApp {
  /**
   * レンダラーのパラメーター
   */
  static RENDERER_PARAM = {
    clearColor: 0x666666,
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
    position: new THREE.Vector3(0.0, 0.0, 20.0),
    lookAt: new THREE.Vector3(0.0, 15.0, 0.0),
  };

  /**
   * 平行光源のパラメーター
   */
  static DIRECTIONAL_LIGHT_PARAM = {
    color: 0xffffff,
    intensity: 10.0,
    position: new THREE.Vector3(10.0, 1.0, 5.0),
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
  directionalLight; // 平行光源（ディレクショナルライト）
  ambientLight; // 環境光（アンビエントライト）
  pillarUnder; // ジオメトリ（支柱下側）
  pillarTop; // ジオメトリ（支柱上側）
  base; // ジオメトリ（土台部分）
  center; // ジオメトリ（中央）
  neck; // ジオメトリ（扇風機の首）
  blade1; // ジオメトリ（扇風機の羽1）
  blade2; // ジオメトリ（扇風機の羽2）
  blade3; // ジオメトリ（扇風機の羽3）
  material; // マテリアル
  box; // ボックスメッシュ
  axesHelper; // 軸ヘルパー
  controls; // オービットコントロール

  /**
   * コンストラクタ
   * @constructor
   * @param {HTMLElement} wrapper - canvas 要素を append する親要素
   */
  constructor(wrapper) {
    // レンダラー初期化
    const color = new THREE.Color(ThreeApp.RENDERER_PARAM.clearColor);

    this.renderer = new THREE.WebGLRenderer(); // アンチエイリアスを有効にする
    // this.renderer.setPixelRatio(window.devicePixelRatio); // デバイスのピクセル比を設定
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
    this.material = new THREE.MeshPhongMaterial(ThreeApp.MATERIAL_PARAM);

    // ジオメトリ（支柱下）
    const pillarUnder = new THREE.CylinderGeometry(0.8, 0.8, 6.0, 32.0);
    // ジオメトリ（支柱上）
    const pillarTop = new THREE.CylinderGeometry(0.6, 0.6, 18.0, 32.0);
    // ジオメトリ（土台）
    const base = new THREE.CylinderGeometry(5.0, 5.2, 0.4, 64);
    // ジオメトリ（首）
    const neck = new THREE.CylinderGeometry(1.0, 0.5, 4.0, 32);
    // ジオメトリ（中央）
    const center = new THREE.CapsuleGeometry(0.51, 0.5, 4, 32);
    // ジオメトリ（羽）
    const blade = new THREE.Shape();
    blade.moveTo(0, 0);
    blade.bezierCurveTo(1, -1, 3, -9, 0, -11);
    blade.bezierCurveTo(-1, -12, -4, -12, -6, -11);
    blade.bezierCurveTo(-8, -10, -8, -10, -7, -8);
    blade.bezierCurveTo(-6, -6, -3, -2, -2, -1);
    blade.bezierCurveTo(-1, 0, -1, 0, 0, 0);

    const extrudeSettings = {
      steps: 2,
      depth: 0.1,
      bevelEnabled: false,
    };

    const bladeGeometry = new THREE.ExtrudeGeometry(blade, extrudeSettings);

    // メッシュ
    this.pillarUnder = new THREE.Mesh(pillarUnder, this.material);
    this.pillarUnder.position.y = 3.0;
    this.pillarTop = new THREE.Mesh(pillarTop, this.material);
    this.pillarTop.position.y = 9.0;
    this.base = new THREE.Mesh(base, this.material);
    this.base.position.y = 1.0; // 土台の位置を調整
    this.neck = new THREE.Mesh(neck, this.material);
    this.neck.position.y = 18; // 首の位置を調整
    this.neck.rotation.x = Math.PI / 2;
    this.center = new THREE.Mesh(center, this.material);
    this.center.position.y = 18;
    this.center.rotation.x = Math.PI / 2;
    this.center.position.z = 2.0;

    this.blade1 = new THREE.Mesh(bladeGeometry, this.material);
    // this.blade1.position.y = 18; // 首の位置を調整
    // this.blade1.rotation.y = Math.PI / 12;
    // this.blade1.position.z = 2.5; // 首の位置を調整

    this.blade2 = new THREE.Mesh(bladeGeometry, this.material);
    this.blade2.position.y = 18; // 首の位置を調整
    this.blade2.rotation.y = Math.PI / 12;
    this.blade2.position.z = 2.5; // 首の位置を調整
    this.blade2.rotation.z = -120 * (Math.PI / 180);

    this.blade3 = new THREE.Mesh(bladeGeometry, this.material);
    this.blade3.position.y = 18; // 首の位置を調整
    this.blade3.rotation.y = Math.PI / 12;
    this.blade3.position.z = 2.5; // 首の位置を調整
    this.blade3.rotation.z = 120 * (Math.PI / 180);

    // this.scene.add(this.pillarUnder);
    // this.scene.add(this.pillarTop);
    // this.scene.add(this.base);
    // this.scene.add(this.neck);
    // this.scene.add(this.center);
    this.scene.add(this.blade1);
    // this.scene.add(this.blade2);
    // this.scene.add(this.blade3);

    // ヘルパー
    this.axesHelper = new THREE.AxesHelper(ThreeApp.HELPER_PARAM.axesHelper);
    this.scene.add(this.axesHelper);

    // this.createFanBlade();

    // オービットコントロール
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.render = this.render.bind(this);

    window.addEventListener("resize", () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    });
  }

  createFanBlade() {
    console.log("hoge");
  }

  render() {
    // 恒常ループの設定
    requestAnimationFrame(this.render);

    // コントロールを更新
    this.renderer.render(this.scene, this.camera);
  }
}

(() => {
  const wrapper = document.querySelector("#webgl");

  const app = new ThreeApp(wrapper);
  app.render();
})();
