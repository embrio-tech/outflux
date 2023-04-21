import type { Aggregation, GraphQL } from '../@types'

const aggregation: Aggregation = {
  model: 'Entity' as GraphQL.Model,
  pipeline: [
    {
      $match: {
        type: 'loan',
      },
    },
    {
      $lookup: {
        from: 'sources',
        localField: '_id',
        foreignField: 'entity',
        as: 'pod',
        pipeline: [
          {
            $match: {
              type: 'pod',
            },
          },
          {
            $project: {
              sourceId: '$_id',
              objectId: 1,
              _id: 0,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'sources',
        localField: '_id',
        foreignField: 'entity',
        as: 'chain',
        pipeline: [
          {
            $match: {
              type: 'chain',
            },
          },
          {
            $project: {
              sourceId: '$_id',
              objectId: 1,
              _id: 0,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'sources',
        localField: '_id',
        foreignField: 'entity',
        as: 'subql',
        pipeline: [
          {
            $match: {
              type: 'subql',
            },
          },
          {
            $project: {
              sourceId: '$_id',
              objectId: 1,
              _id: 0,
            },
          },
        ],
      },
    },
    {
      $set: {
        chain: { $first: '$chain' },
        pod: { $first: '$pod' },
        subql: { $first: '$subql' },
      },
    },
    {
      $lookup: {
        from: 'frames',
        localField: 'pod.sourceId',
        foreignField: 'source',
        as: 'pod.latestFrame',
        pipeline: [
          {
            $sort: {
              createdAt: -1,
            },
          },
          { $limit: 1 },
          {
            $project: {
              frameId: '$_id',
              data: 1,
              createdAt: 1,
              _id: 0,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'frames',
        localField: 'chain.sourceId',
        foreignField: 'source',
        as: 'chain.latestFrame',
        pipeline: [
          {
            $sort: {
              createdAt: -1,
            },
          },
          { $limit: 1 },
          {
            $project: {
              frameId: '$_id',
              data: 1,
              createdAt: 1,
              _id: 0,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'frames',
        localField: 'subql.sourceId',
        foreignField: 'source',
        as: 'subql.latestFrame',
        pipeline: [
          {
            $sort: {
              createdAt: -1,
            },
          },
          { $limit: 1 },
          {
            $project: {
              frameId: '$_id',
              data: 1,
              createdAt: 1,
              _id: 0,
            },
          },
        ],
      },
    },
    {
      $set: {
        'chain.latestFrame': { $ifNull: [{ $first: '$chain.latestFrame' }, null] },
        'pod.latestFrame': { $ifNull: [{ $first: '$pod.latestFrame' }, null] },
        'subql.latestFrame': { $ifNull: [{ $first: '$subql.latestFrame' }, null] },
      },
    },
    {
      $group: {
        _id: 'ficoWeightedByNormalizedDebt',
        numerator: { $sum: { $multiply: ['$pod.latestFrame.data.fico', '$chain.latestFrame.data.normalizedDebt'] } },
        denominator: { $sum: '$chain.latestFrame.data.normalizedDebt' },
      },
    },
    {
      $project: {
        _id: 0,
        key1: '$_id',
        value1: { $toDecimal: { $divide: ['$numerator', '$denominator'] } },
      },
    },
  ],
}

export default aggregation
