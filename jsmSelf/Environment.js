import {
    AmbientLight,ArrowHelper,AxesHelper,BoxBufferGeometry,BufferAttribute,BufferGeometry,DirectionalLight,DirectionalLightHelper,Geometry,MeshBasicMaterial,Mesh,MeshLambertMaterial,MeshPhongMaterial,Line,LineBasicMaterial,LineLoop,OrthographicCamera,PerspectiveCamera,PlaneBufferGeometry,Points,PointsMaterial,Scene,SpotLight,SpotLightHelper,Vector3,WebGLRenderer,
} from "/build/three.module.js"
import { OrbitControls } from '/jsm/controls/OrbitControls.js';
import { GUI } from '/jsm/libs/dat.gui.module.js';

/*默认环境配置参数*/
const defaultParam={
    cameraType:'p',
    cameraPos:new Vector3(0, 0, 2),
    lookAtPos:new Vector3(0, 0, 0),
}

/*
* 环境对象
*   属性：
*       canvas canvas画布
*       renderer 渲染器
*       scene 场景
*       camera 相机
*       cameraType 相机类型
*       lightEnv 灯光环境 {ambLight 环境光,spotLight 辅光,dirLight主光}
*       orbitCtrl 轨道控制器，发生变化时会刷新视图
*       axes 坐标轴（辅助对象）
*       gui 辅助开发对象
*   方法：
*       init 初始化
*       crtRender 建立渲染器
*       crtCamera 建立相机
*       crtLight 建立灯光
*       crtOrbitCtrl 轨道控制器
*       render 渲染
*       updateCamera 根据相机类型更新相机，以便自适应窗口
*       crtPerspectiveCamera 建立透视相机
*       crtOrthographicCamera 建立正交相机
*       updatePerspectiveCamera 更新透视相机
*       updateOrthographicCamera 更新正交相机
*       checkCameraType 测试相机类型，返回回调函数
*       resizeFn 相机、渲染器自适应窗口，重新渲染
* */
export default class Environment {
    constructor(container,param={}) {
        this.container=container;
        Object.assign(this,defaultParam,param);
        this.renderer=null;
        this.scene=new Scene();
        this.camera=null;

        this.lightEnv={};
        this.orbitCtrl=null;
        this.axes=null;
        this.gui=new GUI();
    }
    init(){
        const {clientWidth,clientHeight}=this.container;
        this.crtRender(clientWidth,clientHeight);
        this.crtCamera(clientWidth,clientHeight);
        this.crtLight();
        // this.crtOrbitCtrl();
        this.fitWindowSize();
    }
    //建立渲染器
    crtRender(w,h){
        this.renderer = new WebGLRenderer({
            antialias:true
        });
        this.renderer.shadowMap.enabled = true;
        this.renderer.setSize(w,h);
        this.container.appendChild(this.renderer.domElement);
    }
    /*建立相机*/
    crtCamera(width,height){
        this.checkCameraType(()=>{
            this.crtPerspectiveCamera(width,height);
        },()=>{

            this.crtOrthographicCamera(width,height);
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

    /*渲染方法*/
    render() {
        this.renderer.render(this.scene, this.camera);
    }
    /*更新相机*/
    updateCamera(w,h){
        this.checkCameraType(()=>{
            this.updatePerspectiveCamera(w,h);
        },()=>{
            console.log('this.cameraPos',this.cameraPos)
            this.updateOrthographicCamera(w,h);
        });
    }

    /*建立透视相机*/
    crtPerspectiveCamera(w,h){
        console.log('crtPerspectiveCamera')
        console.log(w,h)
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
        this.camera = new PerspectiveCamera(fov, aspect, near, far);
        this.camera.position.copy(this.cameraPos);
        this.camera.lookAt(this.lookAtPos);
        // camera.updateMatrixWorld();
        this.scene.add(camera);
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
        this.camera = new OrthographicCamera();
        this.camera.position.copy(this.cameraPos);
        this.camera.lookAt(this.lookAtPos);
        //更新相机的投影矩阵
        this.updateOrthographicCamera(w,h);
        //相机位置
        this.scene.add(this.camera);
    }

    /*更新透视相机*/
    updatePerspectiveCamera(w,h){
        //设置相机视椎体长宽比
        this.camera.aspect = w / h;
        //更新相机的投影矩阵
        this.camera.updateProjectionMatrix();
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
        console.log('-----',this.cameraType)
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
    /*响应窗口变化*/
    fitWindowSize(){
        window.addEventListener('resize',()=>{
            console.log('111111111')
            const {clientWidth,clientHeight}=this.container;
            this.resizeFn(clientWidth,clientHeight);
        })
    }
    /*相机、渲染器自适应窗口，重新渲染*/
    resizeFn(w,h){
        //设置渲染器尺寸
        this.renderer.setSize(w,h);
        //更新相机
        this.updateCamera(w,h);
        //重新渲染
        this.render();
    }
}