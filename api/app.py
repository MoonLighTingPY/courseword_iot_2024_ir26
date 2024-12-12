from flask import Flask, request, jsonify
from flask_cors import CORS
from minheap_impl import create_routes

app = Flask(__name__)
CORS(app)  #  вмикаємо cors до всіх маршрутів

# створюємо маршрути з min heap
create_routes(app)

@app.route('/bellman-ford', methods=['POST'])
def bellman_ford():
    data = request.json
    edges = data['edges']
    start_node = data['startNode']
    
    # ініціалізація відстаней та "попередників"
    distances = {}
    predecessors = {}
    steps = []
    
    # додаємо вершини з ребер
    for edge in edges:
        if edge['source'] not in distances:
            distances[edge['source']] = float('inf')
            predecessors[edge['source']] = None
        if edge['target'] not in distances:
            distances[edge['target']] = float('inf')
            predecessors[edge['target']] = None
    
    distances[start_node] = 0

    # головний цикл алгоритму
    for i in range(len(distances) - 1):
        step_info = {
            "step": i + 1,
            "edges": [],
            "distances": {}
        }
        
        # зберігаємо поточні відстані перед оновленням на цій ітерації
        current_distances = distances.copy()
        step_info["distances"] = current_distances.copy()
        
        changes_made = False
        for edge in edges:
            u = edge['source']
            v = edge['target']
            weight = int(edge['weight'])
            
            # використовуємо поточні вістані для порівняння
            if current_distances[u] != float('inf') and current_distances[u] + weight < current_distances[v]:
                distances[v] = current_distances[u] + weight
                predecessors[v] = u
                step_info["edges"].append({
                    "source": u,
                    "target": v,
                    "updated": True
                })
                changes_made = True
            else:
                step_info["edges"].append({
                    "source": u,
                    "target": v,
                    "updated": False
                })
        
        # форматуємо відстані для цього кроку
        step_info["distances"] = {k: ("Infinity" if v == float('inf') else v) 
                                for k, v in current_distances.items()}
        steps.append(step_info)
        
        if not changes_made:
            break
    
    # додаємо фінальний крок для показу кінцевого стану
    final_step = {
        "step": len(steps) + 1,
        "edges": [{"source": edge['source'], "target": edge['target'], "updated": False} 
                 for edge in edges],
        "distances": {k: ("Infinity" if v == float('inf') else v) 
                     for k, v in distances.items()}
    }
    steps.append(final_step)

    # перевірка на від'ємні цикли
    for edge in edges:
        u = edge['source']
        v = edge['target']
        weight = int(edge['weight'])
        if distances[u] != float('inf') and distances[u] + weight < distances[v]:
            return jsonify({
                "error": "Graph contains a negative-weight cycle"
            }), 400

    # форматуємо фінальні відстані в json
    formatted_distances = {k: ("Infinity" if v == float('inf') else v) 
                         for k, v in distances.items()}

    return jsonify({
        "distances": formatted_distances,
        "steps": steps,
        "path": []
    })

if __name__ == "__main__":
    app.run(debug=True) 