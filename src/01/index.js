"use strict";

import * as THREE from "three";
class ThreeApp {
  /**
   * カメラ定義
   */
  static CAMERA_PARAM = {
    fovY: 60,
    aspect: window.innerWidth / window.innerHeight,
    near: 0.1,
    far: 10.0,
    position: new THREE.Vector3(0.0, 2.0, 5.0),
    lookAt: new THREE.Vector3(0.0, 0.0, 0.0),
  };

  /**
   * レンダラーのパラメーター
   */
  static RENDERER_PARAM = {
    clearColor: 0x666666,
    width: window.innerWidth,
    height: window.innerHeight,
  };

  /**
   * マテリアルのパラメーター
   */
  static MATERIAL_PARAM = {
    color: 0x3399ff, // マテリアルの基本色
  };

  renderer; // レンダラ
  scene; // シーン
  camera; // カメラ
  geometry; // ジオメトリ
  material; // マテリアル
  box; // ボックスメッシュ

  /**
   * @constructor
   * @param {HTMLElement} wrapper canvas要素をappendする親要素
   */
  constructor(wrapper) {
    // レンダラー初期化
    const color = new THREE.Color(ThreeApp.RENDERER_PARAM.clearColor);

    this.renderer = new THREE.WebGLRenderer();
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

    // ジオメトリ
    this.geometry = new THREE.BoxGeometry(1.0, 1.0, 1.0);

    // マテリアル
    this.material = new THREE.MeshBasicMaterial(ThreeApp.MATERIAL_PARAM);

    // メッシュ
    this.box = new THREE.Mesh(this.geometry, this.material);

    this.scene.add(this.box);
  }

  render = () => {
    this.renderer.render(this.scene, this.camera);
  };
}

(() => {
  const wrapper = document.querySelector("#webgl");

  const app = new ThreeApp(wrapper);
  app.render();
})();
