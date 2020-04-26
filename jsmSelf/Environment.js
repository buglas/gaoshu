/*
* 环境对象
* 属性：
*   renderer 渲染器
*   scene 场景
*   camera 相机
*   orbitCtrl 控制器
*   axes 坐标轴
*
* */
import {
    ArrowHelper,AxesHelper,BoxBufferGeometry,BufferAttribute,BufferGeometry,DirectionalLight,DirectionalLightHelper,Geometry,MeshBasicMaterial,Mesh,MeshLambertMaterial,MeshPhongMaterial,Line,LineBasicMaterial,LineLoop,OrthographicCamera,PerspectiveCamera,PlaneBufferGeometry,Points,PointsMaterial,Scene,SpotLight,SpotLightHelper,Vector3,WebGLRenderer,
} from "/build/three.module.js"
import { OrbitControls } from '/jsm/controls/OrbitControls.js';
import { GUI } from '/jsm/libs/dat.gui.module.js';

export default class Environment {
    constructor({canvas,cameraType='p'}) {
        this.canvas=canvas;
        this.renderer=null;
        this.scene=new Scene();
        this.camera=null;
        this.cameraType=cameraType;
        this.lightEnv={};
        this.orbitCtrl=null;
        this.axes=null;
        this.gui=new GUI();
    }
    init(){

    }
    //建立渲染器
    crtRender(){
        /*获取canvas 元素
        * 获取视口尺寸
        * */
        // const canvas = document.querySelector('#canvas');
        // [viewW,viewH] = [window.innerWidth,window.innerHeight];
        /*渲染器对象 WebGLRenderer
        * setSize：设置渲染尺寸
        * */
        this.renderer = new WebGLRenderer({
            canvas:this.camera,
            antialias:true
        });
        this.renderer.shadowMap.enabled = true;
        // renderer.setSize(viewW, viewH);
    }
    /*建立相机*/
    crtCamera(){
        this.checkCameraType(()=>{
            this.crtPerspectiveCamera();
        },()=>{
            this.crtOrthographicCamera();
        });
    }
    /*建立灯光对象*/
    crtLight(){
        let ambLight=new AmbientLight( 0x404040 );
        this.scene.add( ambLight );

        let spotLight = new SpotLight( 0xffffff,0.7);
        spotLight.angle = Math.PI / 5;
        spotLight.penumbra = 0.2;
        spotLight.position.set( 2, 3, 3 );
        spotLight.castShadow = true;
        spotLight.shadow.camera.near = 3;
        spotLight.shadow.camera.far = 10;
        spotLight.shadow.mapSize.width = 1024;
        spotLight.shadow.mapSize.height = 1024;
        this.scene.add( spotLight );

        let dirLight = new DirectionalLight( 0x55505a, 1.3 );
        dirLight.position.set( 0, 3, 0 );
        dirLight.castShadow = true;
        dirLight.shadow.camera.near = 1;
        dirLight.shadow.camera.far = 10;
        dirLight.shadow.camera.right = 1;
        dirLight.shadow.camera.left = - 1;
        dirLight.shadow.camera.top	= 1;
        dirLight.shadow.camera.bottom = - 1;

        dirLight.shadow.mapSize.width = 1024;
        dirLight.shadow.mapSize.height = 1024;
        this.scene.add( dirLight );

        this.lightEnv={ambLight,spotLight,dirLight};
    }
    /*建立轨道控制器*/
    crtOrbitCtrl(){
        /*轨道控制器 OrbitControls*/
        this.orbitCtrl = new OrbitControls(this.camera, this.renderer.domElement);
        /*当轨道控制器发生改变时，进行渲染*/
        const _this=this;
        this.orbitCtrl.addEventListener('change',function(){
            _this.render();
        });
    }
    /*建立坐标系*/
    crtAxes();

    /*渲染方法*/
    render() {
        this.renderer.render(this.scene, this.camera);
    }
    /*更新相机*/
    updateCamera(w,h){
        this.checkCameraType(()=>{
            this.updatePerspectiveCamera(w,h);
        },()=>{
            this.updateOrthographicCamera(w,h);
        });
    }
    
    /*建立透视相机*/
    crtPerspectiveCamera(w,h){
        /*透视相机PerspectiveCamera
        * fov：摄像机视锥体垂直视野角度
        * aspect：摄像机视锥体长宽比
        * near：摄像机视锥体近端面
        * far：摄像机视锥体远端面
        * */
        const fov = 45;
        const aspect = w / h;
        const near = 0.01;
        const far = 10;
        const camera = new PerspectiveCamera(fov, aspect, near, far);
        camera.position.set(0, 0, 1.0 );
        camera.lookAt(this.scene.position);
        this.scene.add(camera);
        this.camera=camera;
    }
    /*建立正交相机*/
    crtOrthographicCamera(w,h){
        /*正交相机 OrthographicCamera
        * left — 摄像机视锥体左侧面。
        * right — 摄像机视锥体右侧面。
        * top — 摄像机视锥体上侧面。
        * bottom — 摄像机视锥体下侧面。
        * near — 摄像机视锥体近端面。
        * far — 摄像机视锥体远端面。
        * */
        //实例化正交相机
        const camera = new OrthographicCamera();
        camera.near=0.1;
        camera.far=10;
        camera.position.set(0, 0, 4);
        camera.lookAt(this.scene.position);
        //更新相机的投影矩阵
        updateCamera(w,h);
        //相机位置
        // camera.position.set(0.5,0.5,1);
        this.scene.add(camera);
        this.camera=camera;
    }

    /*更新透视相机*/
    updatePerspectiveCamera(w,h){
        //设置相机视椎体长宽比
        camera.aspect = w / h;
        //更新相机的投影矩阵
        camera.updateProjectionMatrix();
    }
    /*更新正交相机*/
    updateOrthographicCamera(w,h){
        const s = 0.5;
        const k = w / h;
        this.camera.left=-s * k;
        this.camera.right=s * k;
        this.camera.top=s;
        this.camera.bottom=-s;
        this.camera.updateProjectionMatrix();
    }
    /*检测相机类型*/
    checkCameraType(p,o){
        if(this.cameraType==='p'){
            p();
        }else if(this.cameraType==='o'){
            o();
        }
    }
    /*建立坐标系*/
    crtAxes(){
        /*坐标轴*/
        this.axesHelper = new AxesHelper( 1);
        this.axesHelper.visible=false;
        this.scene.add( axesHelper );
    }

    resizeFn(w,h){
        //设置渲染器尺寸
        this.renderer.setSize(w,h);
        //更新相机
        this.updateCamera(w,h);
        //重新渲染
        this.render();
    }
}