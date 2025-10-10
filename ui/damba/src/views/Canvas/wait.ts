// canvas/wait.ts
export async function waitForLayout(api: { engine: { current: any } }) {
    const get = () => api.engine.current?.getState?.()
    // wait until engine exists and has dimensions
    while (true) {
        const st = get()
        if (st && st.width > 0 && st.height > 0) break
        await new Promise(r => requestAnimationFrame(r))
    }
    // give the engine a frame to draw once at that size
    await new Promise(r => requestAnimationFrame(r))
}

