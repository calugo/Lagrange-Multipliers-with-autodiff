#!/usr/bin/env python3
from LagrangeMultipliers_lib import *
import matplotlib.pyplot as plt

def main(args):
    #Adjustable Simulation Parameters
    #Time Step
    h=1e-3; 
    #Saving time step:
    dtp=10*h; tp=dtp;
    #All the functions in the demo
    cases = ['plane','paraboloid','wave','slope','parabola','hills']
    
    #Adjustable Landscape Parameters:
    PRMS = np.zeros((6,2));
    ro = [];

    #Initial Setup: xo,yo,zo=f(xo,yo),vxo,vyo,vzo
    a=1.0;b=0.5;xo=0.0;yo=0.0; #Plane
    ro.append([xo,yo,plane(a,b,xo,yo),0.0,0.0,0.0])
    PRMS[0,:]=np.array((a,b));
    
    a=0.2;b=0.5; xo=1.0;yo=0.5; #Paraboloid
    ro.append([xo,yo,paraboloid(a,b,xo,yo),0.0,0.0,0.0])
    PRMS[1,:]=np.array((a,b));

    a=0.3;b=0.4; xo=1.0; yo=1.0; #Wave
    ro.append([xo,yo,wave(a,b,xo,yo),0.0,0.0,0.0])
    PRMS[2,:]=np.array((a,b));

    a=1.0;b=1.0; xo=0.0; #Slope 
    ro.append([xo,slope(a,b,xo),0.0,0.0])
    PRMS[3,:]=np.array((a,b));

    a=1.0;b=0.0; xo=0.5; #Parabola 
    ro.append([xo,parabola(a,b,xo),0.0,0.0])
    PRMS[4,:]=np.array((a,b));

    a=4.0;b=0.5; xo=0.0; #Hills 
    ro.append([xo,hills(a,b,xo),0.0,0.0])
    PRMS[5,:]=np.array((a,b));

    print(PRMS)
    print(ro)
    #for plotting
    x = np.arange(-2, 2, 0.01)
    y = np.arange(-2, 2, 0.01)
    X, Y = np.meshgrid(x, y)

    n=0
    for k in cases:
        print(k)
        t=0.0; uo = ro[n]; tp=dtp
        print(uo)
        tn = []; xn =[]; yn=[]; zn=[];

        tn.append(0.0); xn.append(uo[0]) ; yn.append(uo[1]);
        
        if k in ['plane','paraboloid','wave']:
            zn.append(uo[2]);
        
        #Runge-Kutta Loop
        u=uo;
        if k in ['plane','slope']:
            Tf= 1.0
        else:
            Tf=3.0
        while (t<Tf):
            
            k1 = kn(u,PRMS[n],k);
            k2 = kn(u+0.5*h*k1,PRMS[n],k);
            k3 = kn(u+0.5*h*k2,PRMS[n],k);
            k4 = kn(u+h*k3,PRMS[n],k);
            u = u + (h/6)*(k1+2*k2+2*k3+k4);
            t+=h

            if t>tp:
                tn.append(0.0); 
                xn.append(u[0]); 
                yn.append(u[1]);
                if k in ['plane','paraboloid','wave']:
                    zn.append(u[2]);
                tp+=dtp

        A = PRMS[n,0]; B=PRMS[n,1];

        if k in ['plane','paraboloid','wave']:
            print("-----------")
            if k == 'plane':
                Z = plane(A,B,X,Y)
            if k == 'paraboloid':
                Z =  paraboloid(A,B,X,Y)
            if k =='wave':
                Z = wave(A,B,X,Y)

            fig = plt.figure()
            ax = fig.add_subplot(projection='3d')
            ax.plot_wireframe(X,Y,Z,linewidth=0.2,color='grey',alpha=0.95)
            ax.scatter(xn, yn, zn,color='r',s=5.0)
            ax.scatter(xn[0],yn[0],zn[0],color='blue',s=1.5)
            fig.suptitle(k, fontsize=20)
            fig.savefig(k+'.png',bbox_inches='tight')
            
        else:
            if k == 'slope':
                Y = slope(A,B,x)
            if k == 'parabola':
                Y = parabola(A,B,x);
            if k == 'hills':
                Y = hills(A,B,x); 
            fig = plt.figure()
            ax= fig.add_subplot()
            ax.plot(x,Y,'--',color='black');
            ax.scatter(xn, yn,color='red')
            ax.scatter(xn[0],yn[0],color='blue')
            fig.suptitle(k, fontsize=20)
            fig.savefig(k+'.png',bbox_inches='tight')
        n+=1


if __name__ == "__main__":
    main(sys.argv[1:])
