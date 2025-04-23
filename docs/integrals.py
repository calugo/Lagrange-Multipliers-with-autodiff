import autograd.numpy as np 
from autograd import grad
from pyodide.ffi import to_js 

def plane(a,b,x,y):
    return a*x + b*y

    
def paraboloid(a,b,x,y):
    return a*x*x + b*y*y

def wave(a,b,x,y):
    return 0.2*(x*x+y*y)*np.cos(a*x*x+b*y*y)


def kn(r,pars,case):
    a = pars[0]
    b = pars[1]
    g = 10
    if case in ['plane','paraboloid','wave']:
        
        if case == 'plane':
            fn = plane
        if case == 'paraboloid':
            fn = paraboloid
        if case == 'wave':
            fn = wave
        
        x = r[0]; y = r[1]; z = r[2]
        vx = r[3]; vy =r[4]; vz= r[5]
        
        fx = grad(fn,2)(a,b,x,y)
        fy = grad(fn,3)(a,b,x,y)
        
        dg = np.array([fx,fy,1])
        dg2 = np.dot(dg,dg)
        
        fxx = grad(grad(fn,2),2)(a,b,x,y)
        fyy = grad(grad(fn,3),3)(a,b,x,y)

        fxy = grad(grad(fn,2),3)(a,b,x,y)
        fyx = grad(grad(fn,3),2)(a,b,x,y)

        ddg = np.array([fxx*vx*vx,fyy*vy*vy,g,vx*vy*(fxy+fyx)])
        Num = np.sum(ddg)
        Den = dg2
        A = Num/dg2
        
        F = np.array([vx,vy,vz,-A*fx,-A*fy,-g+A])
        
        return F
    

def RK(tf,ro,case,h,a,b):

    
    dtp = 1e-3
    tp = dtp
    t = 0.0;
    u = np.zeros(6)
    u[0:3] = ro
    prm = [a,b]

    #tn = [0.0]

    rn = []
    rn.append([t,u[0],u[1],u[2]])

    while t<tf:
        k1 = kn(u,prm,case)
        k2 = kn(u+0.5*h*k1,prm,case)
        k3 = kn(u+0.5*h*k2,prm,case)
        k4 = kn(u+h*k3,prm,case)
        u = u+ (h/6.0)*(k1+2*k2+2*k3+k4)
        t+=h

        if t>tp:
            #output_div.innerText = "Running"+str(t)
            ##print(t)
            rn.append([t,u[0],u[1],u[2]])
        
            tp+=dtp
    #print(rn)
    return to_js(rn)

