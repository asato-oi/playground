"use strict";

import * as THREE from "three";

(() => {
  console.log(THREE);
  const wrapper = document.querySelector("#webgl");
})();

class ThreeApp {
  /**
   * カメラ定義
   */
  static CAMERA = {
    fovY: 60,
    aspect: window.innerWidth / window.innerHeight,
    near: 0.1,
    far: 10.0,
    position: new THREE.Vector3(0.0, 2.0, 5.0),
    lookAt: new THREE.Vector3(0.0, 0.0, 0.0),
  };

  renderer; // レンダラー = 

  /**
   * @constructor
   * @param {HTMLElement} wrapper canvas要素をappendする親要素
   */
  constructor(wrapper) {

  }
}
