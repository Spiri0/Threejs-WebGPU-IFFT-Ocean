import {THREE, WebGPURenderer, WebGPU, RenderPass, ShaderPass, EffectComposer, CopyShader} from './three-defs.js';
import {MeshBasicNodeMaterial, texture} from "three/nodes";
import {entity} from "./entity.js";


export const threejs_component = (() => {
	
	class ThreeJSController extends entity.Component {
		constructor() {
			super();
		}
		
		InitEntity() {
			
			if (WebGPU.isAvailable() === false) {
				document.body.appendChild(WebGPU.getErrorMessage());
				throw new Error('Your Browser does not support WebGPU yet');
			}

			this.threejs_ = new WebGPURenderer({ 
				canvas: document.createElement('canvas'),
				antialias: true,
			});
    	
			this.threejs_.outputColorSpace = THREE.SRGBColorSpace;
			this.threejs_.setPixelRatio(window.devicePixelRatio);
			this.threejs_.shadowMap.enabled = true;
			this.threejs_.shadowMap.type = THREE.PCFSoftShadowMap;
			this.threejs_.physicallyCorrectLights = true;
			this.threejs_.domElement.id = 'threejs';


			this.container = document.getElementById('container');
			this.threejs_.setSize(this.container.clientWidth, this.container.clientHeight);
			this.container.appendChild( this.threejs_.domElement );
		

			const aspect = this.container.clientWidth / this.container.clientHeight; 
			const fov = 50;
			const near = 0.1;
			const far = 1E6;
			this.camera_ = new THREE.PerspectiveCamera(fov, aspect, near, far);
			this.scene_ = new THREE.Scene();
			this.threejs_.setClearColor( 0x87CEEB );


		}


		Render() {

			this.camera_.layers.enableAll();
			this.threejs_.render(this.scene_, this.camera_);
		}


		Update(timeElapsed) {

		}
    
    
		OnResize_() {
		
			let width, height;
		
			if(window.innerWidth > window.innerHeight){	
				width = 1.0 * window.innerWidth;
				height = 1.0 * window.innerHeight;				
			}		
			if(window.innerHeight > window.innerWidth){	
				width = 1.0 * window.innerWidth;
				height = 1.0 * window.innerHeight;				
			}		
			this.camera_.aspect = width / height;
			this.camera_.updateProjectionMatrix();
			this.threejs_.setSize(width, height);	
		}
  
  	}//end class


  	return {
		ThreeJSController: ThreeJSController,
  	};

})();
