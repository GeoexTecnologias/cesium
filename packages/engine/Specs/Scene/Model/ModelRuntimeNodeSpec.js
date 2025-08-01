import {
  Axis,
  Cartesian3,
  InstancingPipelineStage,
  Matrix3,
  Matrix4,
  ModelRuntimeNode,
  ModelMatrixUpdateStage,
  NodeStatisticsPipelineStage,
  Quaternion,
} from "../../../index.js";

describe("Scene/Model/ModelRuntimeNode", function () {
  const mockNode = {
    matrix: Matrix4.IDENTITY,
  };

  const mockRuntimeNode = {
    transform: Matrix4.IDENTITY,
  };

  const mockChildRuntimeNode = {
    transform: Matrix4.IDENTITY,
  };

  const transform = Matrix4.clone(Matrix4.IDENTITY);
  const transformToRoot = Matrix4.clone(Matrix4.IDENTITY);
  const mockSceneGraph = {
    computedModelMatrix: Matrix4.clone(Matrix4.IDENTITY),
    _runtimeNodes: [mockChildRuntimeNode, mockRuntimeNode],
    components: {
      upAxis: Axis.Y,
      forwardAxis: Axis.Z,
    },
  };

  const scratchMatrix = new Matrix4();
  function verifyTransforms(
    transform,
    transformToRoot,
    runtimeNode,
    originalTransform,
  ) {
    originalTransform = originalTransform ?? transform;

    expect(runtimeNode.transform).toEqual(transform);
    expect(runtimeNode.originalTransform).toEqual(originalTransform);
    expect(runtimeNode.transformToRoot).toEqual(transformToRoot);

    const computedTransform = Matrix4.multiplyTransformation(
      transformToRoot,
      transform,
      scratchMatrix,
    );

    expect(runtimeNode.computedTransform).toEqual(computedTransform);
  }

  it("throws for undefined node", function () {
    expect(function () {
      return new ModelRuntimeNode({
        node: undefined,
        transform: transform,
        transformToRoot: transformToRoot,
        sceneGraph: mockSceneGraph,
        children: [],
      });
    }).toThrowDeveloperError();
  });

  it("throws for undefined transform", function () {
    expect(function () {
      return new ModelRuntimeNode({
        node: mockNode,
        transform: undefined,
        transformToRoot: transformToRoot,
        sceneGraph: mockSceneGraph,
        children: [],
      });
    }).toThrowDeveloperError();
  });

  it("throws for undefined transform to root", function () {
    expect(function () {
      return new ModelRuntimeNode({
        node: mockNode,
        transform: transform,
        transformToRoot: undefined,
        sceneGraph: mockSceneGraph,
        children: [],
      });
    }).toThrowDeveloperError();
  });

  it("throws for undefined scene graph", function () {
    expect(function () {
      return new ModelRuntimeNode({
        node: mockNode,
        transform: transform,
        transformToRoot: transformToRoot,
        sceneGraph: undefined,
        children: [],
      });
    }).toThrowDeveloperError();
  });

  it("throws for undefined children", function () {
    expect(function () {
      return new ModelRuntimeNode({
        node: mockNode,
        transform: transform,
        sceneGraph: mockSceneGraph,
        trasnformToRoot: transformToRoot,
        children: undefined,
      });
    }).toThrowDeveloperError();
  });

  it("constructs", function () {
    const node = new ModelRuntimeNode({
      node: mockNode,
      transform: transform,
      transformToRoot: transformToRoot,
      sceneGraph: mockSceneGraph,
      children: [],
    });

    expect(node.node).toBe(mockNode);
    expect(node.sceneGraph).toBe(mockSceneGraph);
    expect(node.children.length).toEqual(0);

    verifyTransforms(transform, transformToRoot, node);

    expect(node.show).toBe(true);
    expect(node.userAnimated).toBe(false);

    node.configurePipeline();
    expect(node.pipelineStages).toEqual([NodeStatisticsPipelineStage]);
    expect(node.updateStages).toEqual([ModelMatrixUpdateStage]);
    expect(node.runtimePrimitives).toEqual([]);

    expect(node.translation).toBeUndefined();
    expect(node.rotation).toBeUndefined();
    expect(node.scale).toBeUndefined();

    expect(node.morphWeights).toEqual([]);
  });

  it("constructs with default transform parameters", function () {
    const mockNodeWithNoMatrix = {};

    const node = new ModelRuntimeNode({
      node: mockNodeWithNoMatrix,
      transform: transform,
      transformToRoot: transformToRoot,
      sceneGraph: mockSceneGraph,
      children: [],
    });

    expect(node.node).toBe(mockNodeWithNoMatrix);
    expect(node.sceneGraph).toBe(mockSceneGraph);
    expect(node.children.length).toEqual(0);

    verifyTransforms(transform, transformToRoot, node);

    expect(node.translation).toEqual(Cartesian3.ZERO);
    expect(node.rotation).toEqual(Quaternion.IDENTITY);
    expect(node.scale).toEqual(new Cartesian3(1.0, 1.0, 1.0));
  });

  it("constructs with given transform parameters", function () {
    const mockNodeWithParameters = {
      translation: new Cartesian3(1.0, 2.0, 3.0),
      rotation: new Quaternion(0.707, 0.0, 0.707, 0.0),
      scale: new Cartesian3(1.0, 1.0, 2.0),
    };

    const node = new ModelRuntimeNode({
      node: mockNodeWithParameters,
      transform: transform,
      transformToRoot: transformToRoot,
      sceneGraph: mockSceneGraph,
      children: [],
    });

    expect(node.node).toBe(mockNodeWithParameters);
    expect(node.sceneGraph).toBe(mockSceneGraph);
    expect(node.children.length).toEqual(0);

    verifyTransforms(transform, transformToRoot, node);

    expect(node.translation).toEqual(new Cartesian3(1.0, 2.0, 3.0));
    expect(node.rotation).toEqual(new Quaternion(0.707, 0.0, 0.707, 0.0));
    expect(node.scale).toEqual(new Cartesian3(1.0, 1.0, 2.0));
  });

  it("setting translation throws if node was constructed with matrix", function () {
    const node = new ModelRuntimeNode({
      node: mockNode,
      transform: transform,
      transformToRoot: transformToRoot,
      sceneGraph: mockSceneGraph,
      children: [],
    });

    expect(function () {
      node.translation = new Cartesian3(1.0, 2.0, 3.0);
    }).toThrowDeveloperError();
  });

  it("setting rotation throws if node was constructed with matrix", function () {
    const node = new ModelRuntimeNode({
      node: mockNode,
      transform: transform,
      transformToRoot: transformToRoot,
      sceneGraph: mockSceneGraph,
      children: [],
    });

    expect(function () {
      node.rotation = Quaternion.IDENTITY;
    }).toThrowDeveloperError();
  });

  it("setting scale throws if node was constructed with matrix", function () {
    const node = new ModelRuntimeNode({
      node: mockNode,
      transform: transform,
      transformToRoot: transformToRoot,
      sceneGraph: mockSceneGraph,
      children: [],
    });

    expect(function () {
      node.scale = new Cartesian3(1.0, 1.0, 2.0);
    }).toThrowDeveloperError();
  });

  it("setting morphWeights throws if given different length array", function () {
    const node = new ModelRuntimeNode({
      node: mockNode,
      transform: transform,
      transformToRoot: transformToRoot,
      sceneGraph: mockSceneGraph,
      children: [],
    });

    expect(function () {
      node.morphWeights = [0.0, 1.0, 2.0];
    }).toThrowDeveloperError();
  });

  const scratchTransform = new Matrix4();

  it("sets translation", function () {
    const mockNodeWithTranslation = {
      translation: Cartesian3.ZERO,
    };

    const node = new ModelRuntimeNode({
      node: mockNodeWithTranslation,
      transform: transform,
      transformToRoot: transformToRoot,
      sceneGraph: mockSceneGraph,
      children: [],
    });

    verifyTransforms(transform, transformToRoot, node);
    expect(node.translation).toEqual(Cartesian3.ZERO);

    const translation = new Cartesian3(1.0, 2.0, 3.0);
    node.translation = translation;
    node.updateComputedTransform(transformToRoot);

    const translationMatrix = Matrix4.fromTranslation(
      translation,
      scratchTransform,
    );

    expect(node.translation).toEqual(translation);
    verifyTransforms(translationMatrix, transformToRoot, node, transform);
  });

  it("sets rotation", function () {
    const mockNodeWithRotation = {
      rotation: Quaternion.IDENTITY,
    };

    const node = new ModelRuntimeNode({
      node: mockNodeWithRotation,
      transform: transform,
      transformToRoot: transformToRoot,
      sceneGraph: mockSceneGraph,
      children: [],
    });

    verifyTransforms(transform, transformToRoot, node);
    expect(node.rotation).toEqual(Quaternion.IDENTITY);

    const rotation = new Quaternion(0.707, 0.0, 0.707, 0.0);
    node.rotation = rotation;
    node.updateComputedTransform(transformToRoot);

    const rotationMatrix3 = Matrix3.fromQuaternion(rotation, new Matrix3());
    const rotationMatrix = Matrix4.fromRotation(
      rotationMatrix3,
      scratchTransform,
    );

    expect(node.rotation).toEqual(rotation);
    verifyTransforms(rotationMatrix, transformToRoot, node, transform);
  });

  it("sets scale", function () {
    const mockNodeWithScale = {
      scale: new Cartesian3(1.0, 1.0, 1.0),
    };

    const node = new ModelRuntimeNode({
      node: mockNodeWithScale,
      transform: transform,
      transformToRoot: transformToRoot,
      sceneGraph: mockSceneGraph,
      children: [],
    });

    verifyTransforms(transform, transformToRoot, node);
    expect(node.scale).toEqual(new Cartesian3(1.0, 1.0, 1.0));

    const scale = new Cartesian3(2.0, 3.0, 4.0);
    node.scale = scale;
    node.updateComputedTransform(transformToRoot);

    const scaleMatrix = Matrix4.fromScale(scale, scratchTransform);

    expect(node.scale).toEqual(scale);
    verifyTransforms(scaleMatrix, transformToRoot, node, transform);
  });

  it("sets morphWeights", function () {
    const mockNodeWithWeights = {
      morphWeights: [0.0, 0.0, 0.0],
    };

    const node = new ModelRuntimeNode({
      node: mockNodeWithWeights,
      transform: transform,
      transformToRoot: transformToRoot,
      sceneGraph: mockSceneGraph,
      children: [],
    });

    expect(node.morphWeights).not.toBe(mockNodeWithWeights.morphWeights);
    expect(node.morphWeights).toEqual(mockNodeWithWeights.morphWeights);

    const morphWeights = [1.0, 2.0, 3.0];
    node.morphWeights = morphWeights;

    expect(node.morphWeights).not.toBe(morphWeights);
    expect(node.morphWeights).toEqual(morphWeights);
  });

  it("adds instancing pipeline stage if node is instanced", function () {
    const instancedMockNode = {
      instances: {
        attributes: [],
      },
    };
    const node = new ModelRuntimeNode({
      node: instancedMockNode,
      transform: transform,
      transformToRoot: transformToRoot,
      sceneGraph: mockSceneGraph,
      children: [],
    });

    expect(node.node).toBe(instancedMockNode);
    expect(node.sceneGraph).toBe(mockSceneGraph);
    expect(node.children.length).toEqual(0);

    verifyTransforms(transform, transformToRoot, node);

    node.configurePipeline();
    expect(node.pipelineStages).toEqual([
      InstancingPipelineStage,
      NodeStatisticsPipelineStage,
    ]);
    expect(node.updateStages).toEqual([ModelMatrixUpdateStage]);
    expect(node.runtimePrimitives).toEqual([]);
  });

  it("getChild throws for undefined index", function () {
    const node = new ModelRuntimeNode({
      node: mockNode,
      transform: transform,
      transformToRoot: transformToRoot,
      sceneGraph: mockSceneGraph,
      children: [0],
    });

    expect(function () {
      node.getChild();
    }).toThrowDeveloperError();
  });

  it("getChild throws for invalid index", function () {
    const node = new ModelRuntimeNode({
      node: mockNode,
      transform: transform,
      transformToRoot: transformToRoot,
      sceneGraph: mockSceneGraph,
      children: [0],
    });

    expect(function () {
      node.getChild("s");
    }).toThrowDeveloperError();
  });

  it("getChild throws for out of range index", function () {
    const node = new ModelRuntimeNode({
      node: mockNode,
      transform: transform,
      transformToRoot: transformToRoot,
      sceneGraph: mockSceneGraph,
      children: [0],
    });

    expect(function () {
      node.getChild(2);
    }).toThrowDeveloperError();
    expect(function () {
      node.getChild(-1);
    }).toThrowDeveloperError();
  });

  it("getChild works", function () {
    const node = new ModelRuntimeNode({
      node: mockNode,
      transform: transform,
      transformToRoot: transformToRoot,
      sceneGraph: mockSceneGraph,
      children: [0],
    });

    const child = node.getChild(0);
    expect(child).toBeDefined();
    expect(child.transform).toBeDefined();
  });

  it("sets transform without replacing original", function () {
    const node = new ModelRuntimeNode({
      node: mockNode,
      transform: transform,
      transformToRoot: transformToRoot,
      sceneGraph: mockSceneGraph,
      children: [0],
    });

    const newTransform = Matrix4.multiplyByTranslation(
      Matrix4.IDENTITY,
      new Cartesian3(10, 0, 0),
      new Matrix4(),
    );

    node.transform = newTransform;

    expect(Matrix4.equals(node.transform, newTransform)).toBe(true);
    expect(Matrix4.equals(node.originalTransform, transform)).toBe(true);
  });

  it("updateComputedTransform updates computedTransform matrix", function () {
    const node = new ModelRuntimeNode({
      node: mockNode,
      transform: transform,
      transformToRoot: transformToRoot,
      sceneGraph: mockSceneGraph,
      children: [0],
    });

    verifyTransforms(transform, transformToRoot, node);

    const newTransform = Matrix4.multiplyByTranslation(
      Matrix4.IDENTITY,
      new Cartesian3(10, 0, 0),
      new Matrix4(),
    );

    node.transform = newTransform;
    node.updateComputedTransform(transformToRoot);

    const originalTransform = transform;
    verifyTransforms(newTransform, transformToRoot, node, originalTransform);
  });
});
