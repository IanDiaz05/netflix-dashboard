declare module "world-atlas/countries-110m.json" {
  const topology: {
    type: "Topology"
    objects: {
      countries: {
        type: "GeometryCollection"
        geometries: Array<{
          type: string
          id?: string
          properties: { name: string }
          arcs: unknown
        }>
      }
      land: {
        type: "GeometryCollection"
        geometries: unknown[]
      }
    }
    arcs: unknown
    bbox?: number[]
    transform?: unknown
  }

  export default topology
}
