try:
    import autograd.numpy as np
    from autograd import grad 
    import sys

except ImportError as e:
    sys.stderr.write("Error loading module: %s\n"%str(e))
    sys.exit()

def plane(a,b,x,y):
    return a*x + b*y
    
def paraboloid(a,b,x,y):
    return a*x*x + b*y*y

def wave(a,b,x,y):
    return 0.2*(x**2+y**2)*np.cos(a*x**2+b*y**2)

def slope(a,b,x):
    return a*x+b

def parabola(a,b,x):
    return a*x*x+b

def hills(a,b,x):
    return 0.1*np.exp(-x/a)*np.cos(b*x*x)**2

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
        
    if case in ['slope','parabola','hills']:
        
        if case == 'slope':
            fn = slope
        if case == 'parabola':
            fn = parabola
        if case == 'hills':
            fn = hills
            
        x = r[0]; y=r[1]
        vx= r[2]; vy=r[3]
    
        fx = grad(fn,2)(a,b,x)
        
        dg = np.array([fx,1])
        dg2= np.dot(dg,dg)
        
        fxx = grad(grad(fn,2),2)(a,b,x)
        ddg = np.array([fxx*vx*vx,g])
        
        Num = np.sum(ddg)
        Den = dg2
        A = Num/Den
        F = np.array([vx,vy,-fx*A,-g+A])
        return F
    
    