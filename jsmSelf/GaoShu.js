const {
    Geometry
}=THREE;
let GaoShu={
    /*面积*/
    getArea(points){
        const ps=this.normalizePoints(points);
        const len=ps.length;
        let area=0;
        for(let i=0;i<len-1;i++){
            area+=this.getTriangleArea(ps[i],ps[i+1]);
        }
        return area;
    },
    getTriangleArea(B,C){
        const [bx,by,bz,
            cx,cy,cz]=[B.x,B.y,B.z,C.x,C.y,C.z];
        const P ={
            x : by * cz - bz * cy,
            y : bz * cx - bx * cz,
            z : bx * cy - by * cx,
        };
        const [x,y,z]=[
            by * cz - bz * cy,
            bz * cx - bx * cz,
            bx * cy - by * cx,
        ];
        return  Math.sqrt(x*x+y*y+z*z)/2;
    },
    normalizePoints(points){
        const {x,y,z}=points[0];
        const arr=[];
        for(let i=1;i<points.length;i++){
            const p=points[i];
            arr.push({x:p.x-x,y:p.y-y,z:p.z-z});
        }
        return arr;
    },
    /*体积*/
    volume(geo){
        if(!(geo instanceof Geometry)){
            geo= new Geometry().fromBufferGeometry(geo);
        }
        let V=0;
        // 几何体三角形索引
        for (let i = 0; i < geo.faces.length; i++) {
            // 几何体三角形索引
            const index0 = geo.faces[i].a;
            const index1 = geo.faces[i].b;
            const index2 = geo.faces[i].c;
            // 通过索引访问三角形顶点坐标值
            const p0 = geo.vertices[index0];
            const p1 = geo.vertices[index1];
            const p2 = geo.vertices[index2];
            //使用下面的函数，并不会改变p0, p1, p2引用指向的geo顶点坐标值
            //三角形与坐标原点构成的四面体体积累计计算
            V += GaoShu.vFun(p0, p1, p2);
        }
        return V;
    },
    vFun(p1, p2, p3) {
        //借助threejs的Vector3的叉乘、点乘方法进行计算
        return p1.clone().cross(p2).dot(p3) / 6; //p1叉乘p2点乘p3除以6
    }

};
export default GaoShu;