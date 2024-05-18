import * as THREE from "three";
import { OrbitControls } from "./OrbitControls.js";

window.addEventListener(
  "DOMContentLoaded",
  () => {
    const wrapper = document.querySelector("#webgl");
    const app = new ThreeApp(wrapper);
    app.render();
  },
  false
);

class ThreeApp {
  /**
   * カメラ定義のための定数
   */
  static CAMERA_PARAM = {
    fovy: 60,
    aspect: window.innerWidth / window.innerHeight,
    near: 0.1,
    far: 400.0,
    position: new THREE.Vector3(80.0, 100.0, 180.0),
    lookAt: new THREE.Vector3(0.0, 0.0, 0.0),
  };
  /**
   * レンダラー定義のための定数
   */
  static RENDERER_PARAM = {
    clearColor: 0x666666, // 画面をクリアする色
    width: window.innerWidth, // レンダラーに設定する幅
    height: window.innerHeight, // レンダラーに設定する高さ
  };
  /**
   * マテリアル定義のための定数
   */
  static MATERIAL_PARAM = {
    color: 0xff0000,
  };

  renderer; // レンダラ
  scene; // シーン
  camera; // カメラ
  geometry; // ジオメトリ
  material; // マテリアル
  box; // ボックスメッシュ
  boxGroup; // ボックス群
  controls; // オービットコントロール
  axesHelper; // 軸ヘルパー

  /**
   * コンストラクタ
   * @constructor
   * @param {HTMLElement} wrapper - canvas 要素を append する親要素
   */
  constructor(wrapper) {
    // レンダラー
    const color = new THREE.Color(ThreeApp.RENDERER_PARAM.clearColor);
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor(color);
    this.renderer.setSize(
      ThreeApp.RENDERER_PARAM.width,
      ThreeApp.RENDERER_PARAM.height
    );
    wrapper.appendChild(this.renderer.domElement);

    // シーン
    this.scene = new THREE.Scene();

    // カメラ
    this.camera = new THREE.PerspectiveCamera(
      ThreeApp.CAMERA_PARAM.fovy,
      ThreeApp.CAMERA_PARAM.aspect,
      ThreeApp.CAMERA_PARAM.near,
      ThreeApp.CAMERA_PARAM.far
    );
    this.camera.position.copy(ThreeApp.CAMERA_PARAM.position);
    this.camera.lookAt(ThreeApp.CAMERA_PARAM.lookAt);

    // ジオメトリとマテリアル
    this.geometry = new THREE.BoxGeometry(10, 10, 10);
    this.material = new THREE.MeshBasicMaterial(ThreeApp.MATERIAL_PARAM);

    this.boxGroup = new THREE.Group();

    const rows = 10; // 行の数
    const cols = 10; // 列の数
    const space = 2; // ボックス間の距離

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const box = new THREE.Mesh(this.geometry, this.material);

        const x = col * (10 + space);
        const z = row * (10 + space);

        box.position.set(x, 0, z);
        this.boxGroup.add(box);
      }
    }

    // メッシュ
    // this.box = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.boxGroup);

    // 軸ヘルパー
    const axesBarLength = 100.0;
    this.axesHelper = new THREE.AxesHelper(axesBarLength);
    this.scene.add(this.axesHelper);

    // コントロール
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    // render メソッドはブラウザ制御で再帰的に呼び出されるので this を固定する
    this.render = this.render.bind(this);
  }

  /**
   * 描画処理
   */
  render() {
    // 恒常ループの設定 @@@
    requestAnimationFrame(this.render);

    // コントロールを更新 @@@
    this.controls.update();

    // レンダラーで描画
    this.renderer.render(this.scene, this.camera);
  }
}
