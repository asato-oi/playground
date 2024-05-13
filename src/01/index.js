"use strict";

import * as THREE from "three";
import { OrbitControls } from "./OrbitControls";

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
   * 平行光源のパラメーター
   */
  static DIRECTIONAL_LIGHT_PARAM = {
    color: 0xfffffff,
    intensity: 1.0,
    position: new THREE.Vector3(1.0, 1.0, 1.0),
  };

  /**
   * アンビエントライトのパラメーター
   */
  static AMBIENT_LIGHT_PARAM = {
    color: 0xffffff,
    intensity: 0.1,
  };

  /**
   * マテリアルのパラメーター
   */
  static MATERIAL_PARAM = {
    color: 0xffffff, // マテリアルの基本色
  };

  /**
   * ヘルパーのパラメーター
   */
  static HELPER_PARAM = {
    axesHelper: 5.0,
  };

  renderer; // レンダラ
  scene; // シーン
  camera; // カメラ
  directionalLight; // 平行光源（ディレクショナルライト）
  ambientLight; // 環境光（アンビエントライト）
  geometry; // ジオメトリ
  material; // マテリアル
  box; // ボックスメッシュ
  controls; //オービットコントロール
  axesHelper; // 軸ヘルパー

  isDown = false; // キーの押下状態用フラグ

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

    // ディレクショナルライト
    this.directionalLight = new THREE.DirectionalLight(
      ThreeApp.DIRECTIONAL_LIGHT_PARAM.color,
      ThreeApp.DIRECTIONAL_LIGHT_PARAM.intensity
    );
    this.directionalLight.position.copy(
      ThreeApp.DIRECTIONAL_LIGHT_PARAM.position
    );
    this.scene.add(this.directionalLight);

    // アンビエントライト
    this.ambientLight = new THREE.AmbientLight(
      ThreeApp.AMBIENT_LIGHT_PARAM.color,
      ThreeApp.AMBIENT_LIGHT_PARAM.intensity
    );
    this.scene.add(this.ambientLight);

    // ジオメトリとマテリアル
    this.geometry = new THREE.BoxGeometry(1.0, 1.0, 1.0);
    this.material = new THREE.MeshPhongMaterial(ThreeApp.MATERIAL_PARAM);

    // メッシュ
    this.box = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.box);

    // ヘルパー
    this.axesHelper = new THREE.AxesHelper(ThreeApp.HELPER_PARAM.axesHelper);
    this.scene.add(this.axesHelper);

    // オービットコントロール
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    window.addEventListener("keydown", (e) => {
      switch (e.key) {
        case " ":
          this.isDown = true;
          break;
        default:
      }
    });
    window.addEventListener("keyup", () => {
      this.isDown = false;
    });
    window.addEventListener("resize", () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.camera.aspect = window.innerWidth / window.innerHeight;
      // カメラのパラメータが変更されたときは行列を更新する
      // ※なぜ行列の更新が必要なのかについては、将来的にもう少し詳しく解説します
      this.camera.updateProjectionMatrix();
    });
  }

  render = () => {
    requestAnimationFrame(this.render);

    // 書かなくても大丈夫
    this.controls.update();

    if (this.isDown) {
      this.box.rotation.y += 0.05;
    }
    this.renderer.render(this.scene, this.camera);
  };
}

(() => {
  const wrapper = document.querySelector("#webgl");

  const app = new ThreeApp(wrapper);
  app.render();
})();
